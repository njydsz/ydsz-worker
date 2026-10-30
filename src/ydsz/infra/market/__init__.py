"""Unified marketplace — browse, search, install capabilities across four types.

The market module provides a single facade over four capability markets:

  - **skills**     — downloadable SKILL.md packages (SkillHub / ClawHub / local)
  - **experts**    — agent templates / SkillHub Skillsets / published experts
  - **plugins**    — bundled or git-hosted plugin packages
  - **connectors** — MCP / HTTP / OAuth connectivity presets

Public surface::

    from ydsz.infra.market import MarketManager, InstallService, SearchService
    from ydsz.infra.market.models import MarketItem, MarketDetail
"""

from ydsz.infra.market.install import InstallService
from ydsz.infra.market.manager import MarketManager
from ydsz.infra.market.search import SearchService

__all__ = [
    "MarketManager",
    "InstallService",
    "SearchService",
]
