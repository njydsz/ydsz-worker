"""Market-specific error codes and exception types."""

from __future__ import annotations

from enum import StrEnum


class MarketErrorCode(StrEnum):
    """Error codes returned under the ``"MARKET_*`` namespace in API envelopes.

    These extend :class:`ydsz.infra.errors.ErrorCode` without modifying that
    shared enum — market routes map these to localized `market.*` i18n keys.
    """

    UNSUPPORTED_TYPE = "MARKET_UNSUPPORTED_TYPE"
    ITEM_NOT_FOUND = "MARKET_ITEM_NOT_FOUND"
    INSTALL_FAILED = "MARKET_INSTALL_FAILED"
    INSTALL_CONFLICT = "MARKET_INSTALL_CONFLICT"
    INVALID_TARGET = "MARKET_INVALID_TARGET"
    PROVIDER_UNAVAILABLE = "MARKET_PROVIDER_UNAVAILABLE"
    DOWNLOAD_FAILED = "MARKET_DOWNLOAD_FAILED"
    VALIDATION_FAILED = "MARKET_VALIDATION_FAILED"
    UPDATE_NOT_AVAILABLE = "MARKET_UPDATE_NOT_AVAILABLE"
    SEARCH_UNAVAILABLE = "MARKET_SEARCH_UNAVAILABLE"
    PUBLISH_TERMS_REQUIRED = "MARKET_PUBLISH_TERMS_REQUIRED"


class MarketError(Exception):
    """Base exception for market operations (non-YdszError, for internal use)."""

    def __init__(
        self,
        code: MarketErrorCode,
        message: str,
        *,
        detail: dict[str, object] | None = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.detail = detail or {}
