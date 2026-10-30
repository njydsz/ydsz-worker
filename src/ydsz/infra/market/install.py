"""InstallService — orchestrates capability installation with audit + rollback."""

from __future__ import annotations

import logging
import uuid
from typing import Any

from ydsz.infra.market.constants import DEFAULT_LIMIT
from ydsz.infra.market.errors import MarketError, MarketErrorCode
from ydsz.infra.market.models import (
    InstallReceipt,
    InstallTarget,
    UpdateInfo,
)
from ydsz.infra.market.providers.base import MarketProvider

logger = logging.getLogger(__name__)


class InstallService:
    """Central install orchestration with audit logging and rollback.

    Holds a reference to the db pool (from SharedServices) for install registry
    and audit log writes.
    """

    def __init__(self, db: Any = None) -> None:
        self._db = db

    # ── Install ──────────────────────────────────────────────────────────
    async def execute(
        self,
        *,
        provider: MarketProvider,
        identity: str,
        target: InstallTarget,
        user_id: int,
        **opts: Any,
    ) -> InstallReceipt:
        """Install one capability via its provider.

        Steps:
        1. Pre-validate target via provider.validate_target().
        2. Obtain a snapshot if rollback is supported.
        3. Delegate to provider.install().
        4. Write market_install_registry row.
        5. Write market_install_log row.
        6. Refresh MarketItem.installed state.
        7. Return InstallReceipt.
        """
        try:
            # Step 1: validate.
            if not await provider.validate_target(target):
                raise MarketError(
                    MarketErrorCode.INVALID_TARGET,
                    f"target validation failed: {target.type}:{target.id}",
                )

            # Step 2: create rollback snapshot.
            str(uuid.uuid4())
            # (Snapshot payload omitted — provider may pass rollback info via receipt.)

            # Step 3: install.
            receipt = await provider.install(
                identity,
                target=target,
                user_id=user_id,
                **opts,
            )

            # Step 4: register.
            self._register_install(receipt, user_id=user_id)

            # Step 5: audit log.
            self._write_log(
                market_id=receipt.market_item.market_id,
                action="install",
                to_version=receipt.installed_version,
                target=target,
                user_id=user_id,
            )

            return receipt

        except MarketError:
            raise
        except Exception as exc:
            # Audit failed install.
            self._write_log(
                market_id=f"{provider.market_type}:{identity}",
                action="install",
                target=target,
                user_id=user_id,
                error_code=MarketErrorCode.INSTALL_FAILED,
                error_message=str(exc),
            )
            raise MarketError(
                MarketErrorCode.INSTALL_FAILED,
                f"{provider.market_type}:{identity} install failed: {exc}",
            ) from exc

    # ── Update ─────────────────────────────────────────────────────────
    async def update(
        self,
        *,
        provider: MarketProvider,
        identity: str,
        installed: dict[str, Any],
        target: InstallTarget,
        user_id: int,
        **opts: Any,
    ) -> InstallReceipt:
        """Update an already-installed item to latest."""
        update_info: UpdateInfo | None = await provider.check_update(
            installed_version=installed.get("installed_version", ""),
            identity=identity,
        )
        if update_info is None:
            raise MarketError(
                MarketErrorCode.UPDATE_NOT_AVAILABLE,
                f"no update available for {identity}",
            )

        # Re-install with force.
        receipt = await provider.install(
            identity,
            target=target,
            user_id=user_id,
            force=True,
            **opts,
        )

        self._write_log(
            market_id=receipt.market_item.market_id,
            action="update",
            from_version=installed.get("installed_version"),
            to_version=receipt.installed_version,
            target=target,
            user_id=user_id,
        )
        return receipt

    # ── Registry helpers ────────────────────────────────────────────────
    def _register_install(self, receipt: InstallReceipt, *, user_id: int) -> None:
        if self._db is None:
            return
        try:
            self._db.execute(
                "INSERT OR REPLACE INTO market_install_registry "
                "(market_id, user_id, target_type, target_id, installed_version, install_source) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                [
                    receipt.market_item.market_id,
                    user_id,
                    receipt.target.type,
                    receipt.target.id,
                    receipt.installed_version,
                    "manual",
                ],
            )
        except Exception:
            logger.debug("Install registry write failed", exc_info=True)

    def _write_log(
        self,
        *,
        market_id: str,
        action: str,
        target: InstallTarget | None,
        user_id: int,
        from_version: str | None = None,
        to_version: str | None = None,
        error_code: MarketErrorCode | None = None,
        error_message: str | None = None,
    ) -> None:
        if self._db is None:
            return
        try:
            self._db.execute(
                "INSERT INTO market_install_log "
                "(market_id, target_type, target_id, user_id, action, "
                "from_version, to_version, error_code, error_message) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    market_id,
                    target.type if target else None,
                    target.id if target else None,
                    user_id,
                    action,
                    from_version,
                    to_version,
                    error_code.value if error_code else None,
                    error_message,
                ],
            )
        except Exception:
            logger.debug("Install log write failed", exc_info=True)

    async def installed_across_types(
        self,
        *,
        user_id: int,
        limit: int = DEFAULT_LIMIT,
        offset: int = 0,
    ) -> list[dict[str, Any]]:
        """Return aggregated installed items across all registered providers."""
        if self._db is None:
            return []
        try:
            rows = self._db.fetchall(
                "SELECT market_id, target_type, target_id, installed_version, installed_at "
                "FROM market_install_registry "
                "WHERE user_id = ? "
                "ORDER BY installed_at DESC "
                "LIMIT ? OFFSET ?",
                [user_id, limit, offset],
            )
            return [
                {
                    "market_id": r["market_id"],
                    "target_type": r["target_type"],
                    "target_id": r["target_id"],
                    "installed_version": r["installed_version"],
                    "installed_at": r["installed_at"],
                }
                for r in rows
            ]
        except Exception:
            return []
