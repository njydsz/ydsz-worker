"""conftest — ensure all provider modules are imported (auto-registering
themselves) before any market test runs."""

from __future__ import annotations

import pytest

from ydsz.infra.market.providers import _provider_factories, _provider_instances


@pytest.fixture(autouse=True)
def _ensure_providers_loaded():
    """Auto-import all provider modules to trigger registration.

    Saves and restores the registry state so individual tests that
    register custom providers don't leak into others.
    """
    # Import provider modules to populate registry.
    import ydsz.infra.market.providers.skills_provider  # noqa: F401
    import ydsz.infra.market.providers.experts_provider  # noqa: F401
    import ydsz.infra.market.providers.plugins_provider  # noqa: F401
    import ydsz.infra.market.providers.connectors_provider  # noqa: F401

    saved_factories = dict(_provider_factories)
    saved_instances = dict(_provider_instances)
    yield
    _provider_factories.clear()
    _provider_factories.update(saved_factories)
    _provider_instances.clear()
    _provider_instances.update(saved_instances)
