"""In-process document indexing jobs."""

from __future__ import annotations

import asyncio
import logging
from contextlib import suppress
from typing import Any

from ydsz.infra.knowledge.chunk import chunk_text
from ydsz.infra.knowledge.embed import embed_knowledge_texts
from ydsz.infra.knowledge.files import document_path
from ydsz.infra.knowledge.gate import assert_knowledge_usable
from ydsz.infra.knowledge.index import KnowledgeIndex
from ydsz.infra.knowledge.ocr import optional_ocr_extractor
from ydsz.infra.knowledge.params import get_advanced_settings
from ydsz.infra.knowledge.parse import parse_document

logger = logging.getLogger(__name__)

# Parsing/OCR also consumes memory; index_concurrency defaults to 2
# (configurable via config.json: knowledge.index_concurrency).
_index_semaphore: asyncio.Semaphore | None = None
_index_concurrency: int = 0


def reset_index_semaphore_for_tests() -> None:
    """Drop the cached semaphore so tests can change the concurrency."""
    global _index_semaphore, _index_concurrency
    _index_semaphore = None
    _index_concurrency = 0


def _get_index_semaphore(concurrency: int) -> asyncio.Semaphore:
    global _index_semaphore, _index_concurrency
    if _index_semaphore is None or _index_concurrency != concurrency:
        _index_semaphore = asyncio.Semaphore(max(1, concurrency))
        _index_concurrency = concurrency
    return _index_semaphore


def process_document(services: Any, kb_id: str, doc_id: str) -> None:
    """Synchronously parse, embed, and atomically replace one document's chunks."""
    repo = services.knowledge_repo
    assert_knowledge_usable(services.settings_repo.get, getattr(services, "provider_repo", None))
    document = repo.get_document(doc_id)
    base = repo.get_base(kb_id)
    if document is None or document.kb_id != kb_id or base is None:
        raise LookupError("knowledge document or base not found")
    if document.is_dir:
        return
    repo.update_document(doc_id, status="processing", error_message="")
    try:
        path = document_path(kb_id, doc_id, document.filename)
        text = parse_document(path, ocr=optional_ocr_extractor(services))
        knobs = get_advanced_settings(services.settings_repo.get)
        chunks = chunk_text(text, size=knobs["chunk_size"], overlap=knobs["chunk_overlap"])
        if not (text or "").strip() or not chunks:
            raise ValueError("knowledge document has no extractable text")
        embeddings = embed_knowledge_texts(services, chunks)
        KnowledgeIndex(kb_id).replace_doc_chunks(doc_id, chunks, embeddings)
        dimension = len(embeddings[0]) if embeddings else 0
        repo.update_document(doc_id, status="ready", error_message="", chunk_count=len(chunks))
        if dimension and base.embedding_dim != dimension:
            repo.update_base(kb_id, embedding_dim=dimension)
    except Exception as exc:
        repo.update_document(doc_id, status="failed", error_message=str(exc), chunk_count=0)
        raise


def enqueue_index_document(services: Any, kb_id: str, doc_id: str) -> asyncio.Task[None]:
    """Schedule CPU- and I/O-bound indexing outside the event loop."""
    loop = asyncio.get_running_loop()
    config = getattr(services, "config", None)
    concurrency = 2
    timeout = 300
    if config is not None:
        knowledge_cfg = getattr(config, "knowledge", None)
        if knowledge_cfg is not None:
            concurrency = getattr(knowledge_cfg, "index_concurrency", concurrency)
            timeout = getattr(knowledge_cfg, "index_timeout_seconds", timeout)
    sem = _get_index_semaphore(concurrency)

    async def _run() -> None:
        async with sem:
            try:
                await asyncio.wait_for(
                    loop.run_in_executor(None, process_document, services, kb_id, doc_id),
                    timeout=timeout,
                )
            except TimeoutError:
                logger.error(
                    "knowledge index timeout doc=%s kb=%s limit=%ss",
                    doc_id,
                    kb_id,
                    timeout,
                )
                with suppress(Exception):
                    services.knowledge_repo.update_document(
                        doc_id,
                        status="failed",
                        error_message=f"index timed out after {timeout}s",
                        chunk_count=0,
                    )

    return asyncio.create_task(_run())


def reindex_all_documents(services: Any, embedding_model: str) -> None:
    """Reset every index to use ``embedding_model`` and schedule fresh work."""
    documents = services.knowledge_repo.reindex_all_documents(embedding_model)
    for document in documents:
        enqueue_index_document(services, document.kb_id, document.id)


def resume_pending_index_jobs(services: Any) -> None:
    """Resume pending work and jobs interrupted by a prior process shutdown."""
    documents = services.knowledge_repo.resume_pending_documents()
    for document in documents:
        enqueue_index_document(services, document.kb_id, document.id)
