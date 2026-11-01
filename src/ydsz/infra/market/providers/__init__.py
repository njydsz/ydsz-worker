"""Market provider registry — maps market types to their implementation.

Usage::

    from ydsz.infra.market.providers import get_provider, register_provider

The actual registry lives in :mod:`ydsz.infra.market.providers.registry` (this
module re-exports it) to avoid circular imports.

The provider sub-modules are NOT imported here — doing so would create a
circular import (each provider imports ``.base`` and ``.registry`` while the
package is still initialising). The imports happen in
:mod:`ydsz.infra.market` after this package is fully loaded.
"""

from __future__ import annotations

from ydsz.infra.market.providers.registry import (
    all_providers,
    get_provider,
    register_provider,
    reset_registry,
)

__all__ = [
    "get_provider",
    "register_provider",
    "all_providers",
    "reset_registry",
]
