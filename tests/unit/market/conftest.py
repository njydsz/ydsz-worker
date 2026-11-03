"""conftest — ensure all provider modules are imported (auto-registering
themselves) before any market test runs."""

from __future__ import annotations

import pytest

# Import the package entry point (not the provider submodules directly):
# ``ydsz.infra.market.__init__`` is what triggers each provider's
# ``register_provider()`` call, so importing anything below it in isolation
# leaves the registry empty.
import ydsz.infra.market  # noqa: F401
from ydsz.infra.market.providers.registry import (
    _provider_factories,
    _provider_instances,
)


@pytest.fixture(autouse=True)
def _ensure_providers_loaded():
    """Save and restore the registry so tests that register custom providers
    don't leak into others."""
    saved_factories = dict(_provider_factories)
    saved_instances = dict(_provider_instances)
    yield
    _provider_factories.clear()
    _provider_factories.update(saved_factories)
    _provider_instances.clear()
    _provider_instances.update(saved_instances)
