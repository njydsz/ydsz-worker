"""Require JWT for all /api/* routes except an explicit allowlist.

Validated users are cached on ``request.state.ydsz_user`` so route-level
``Depends(current_user)`` can reuse the result without re-decoding.

When the access token is past the sliding-renew threshold, a fresh token is
attached as ``X-Ydsz-Access-Token`` on the response. When an ``idle_timeout_minutes``
is configured, requests on a token whose ``lat`` (last activity) exceeds the
window are rejected with ``TOKEN_EXPIRED`` — the client should redirect to login.
"""

from __future__ import annotations

import logging
import time
from collections.abc import Awaitable, Callable
from typing import Any

from fastapi import Request
from fastapi.responses import JSONResponse

from ydsz.api.deps import (
    ACCESS_TOKEN_RESPONSE_HEADER,
    authenticate_request,
    extract_raw_token,
    is_jwt_exempt_request,
    maybe_sliding_renew_token,
)
from ydsz.infra.auth.tokens import decode_token, token_last_activity
from ydsz.infra.errors import ErrorCode, YdszError

_INSTALL_ATTR = "_ydsz_jwt_auth_installed"
logger = logging.getLogger(__name__)


def _maybe_reject_idle(server: Any, request: Request) -> None:
    """Reject the request if the token's last activity exceeds the idle window.

    Reads ``idle_timeout_minutes`` from server config. ``0`` (default) disables
    the feature. The check runs *after* the token's signature and ``exp`` are
    already verified, so a pass here means the token is otherwise valid.
    """
    assert server.services is not None
    idle_min = int(getattr(server.services.config, "idle_timeout_minutes", 0) or 0)
    if idle_min <= 0:
        return
    raw = extract_raw_token(
        authorization=request.headers.get("authorization"),
        access_token=request.query_params.get("access_token"),
    )
    if raw is None:
        return
    secret = server.services.secret_repo.get("jwt")
    if secret is None:
        return
    try:
        payload = decode_token(secret, raw)
    except Exception:
        return
    last_act = token_last_activity(payload)
    if last_act and (time.time() - last_act) > idle_min * 60:
        raise YdszError(
            ErrorCode.TOKEN_EXPIRED,
            f"session idle for {idle_min} minutes, please sign in again",
        )


def install(app: Any, server: Any) -> None:
    if getattr(app, _INSTALL_ATTR, False):
        return
    setattr(app, _INSTALL_ATTR, True)

    @app.middleware("http")  # type: ignore[untyped-decorator]
    async def _jwt_auth(
        request: Request,
        call_next: Callable[[Request], Awaitable[Any]],
    ) -> Any:
        path = request.url.path
        if not path.startswith("/api/") or is_jwt_exempt_request(request):
            return await call_next(request)

        raw = extract_raw_token(
            authorization=request.headers.get("authorization"),
            access_token=request.query_params.get("access_token"),
        )
        try:
            user = authenticate_request(request, server)
            _maybe_reject_idle(server, request)
            request.state.ydsz_user = user
        except YdszError as exc:
            # Middleware returns directly (skips FastAPI exception handlers),
            # so resolve the locale here to match the global error handler.
            from ydsz.infra.utils.locale import resolve_request_locale

            locale = resolve_request_locale(request)
            if exc.status >= 500:
                logger.error(
                    "YdszError %s in %s: %s",
                    exc.code.value,
                    request.url.path,
                    exc.message,
                    exc_info=exc,
                )
            return JSONResponse(
                status_code=exc.status,
                content=exc.to_envelope(locale=locale),
            )

        response = await call_next(request)
        if raw is not None:
            try:
                renewed = maybe_sliding_renew_token(server, raw, request.state.ydsz_user)
            except YdszError:
                renewed = None
            if renewed:
                response.headers[ACCESS_TOKEN_RESPONSE_HEADER] = renewed
        return response
