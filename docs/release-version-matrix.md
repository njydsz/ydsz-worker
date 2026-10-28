# Ydsz Monorepo — Version Compatibility Matrix

This document tracks the tested and supported version combinations across the
five Python packages that make up the Ydsz Worker system.

## Package overview

| Package | PyPI name | Current version | Role |
|---------|-----------|-----------------|------|
| ydsz-worker | `ydsz-worker` | `26.10.20` | Root package (FastAPI server + CLI + dashboard) |
| ydsz-harness | `ydsz-harness` | `1.0.4` | Agent harness runtime (SOUL, skills, experts, plugins) |
| ydsz-gateway | `ydsz-gateway` | `1.0.3` | IM channel gateway (DingTalk, WeCom, Feishu, Telegram) |
| ydsz-browser | `ydsz-browser` | `1.0.0` | Browser automation (Playwright) |
| ydsz-memory | `ydsz-memory` | `1.0.2` | Memory system (episodic, semantic storage) |

## Root dependency constraints

From `pyproject.toml` (`[project.dependencies]`):

```
ydsz-harness[all] >= 1.0.4
ydsz-gateway     >= 1.0.3
ydsz-browser     >= 1.0.0
ydsz-memory      >= 1.0.2
```

## Cross-package dependency graph

```
ydsz-worker (root)
├── ydsz-harness[all] >= 1.0.4
│   ├── ydsz-browser  >= 0.9.9   (core dep)
│   └── ydsz-memory   >= 1.0.2   (optional, via [all] extra)
├── ydsz-gateway      >= 1.0.3
├── ydsz-browser      >= 1.0.0   (direct + via harness)
└── ydsz-memory       >= 1.0.2   (direct + via harness)
```

## Version compatibility rules

1. **Root always sets the floor.** The root package's `pyproject.toml` defines
   the minimum supported version of each sub-package. Sub-packages must not
   require a higher root version than what ships with them.

2. **Sub-package major version bumps require root major bump.** If harness
   goes from 1.x → 2.x (breaking API change), root must bump its major too.

3. **`mcp` pin must be aligned across all packages.** As of 2026-10-27 the
   constraint is `>=1.27.1,<2` everywhere. Update all five `pyproject.toml`
   files together when this changes.

4. **`ruff` line-length should converge to 120.** Currently root uses 100 while
   sub-packages use 120. Plan to unify to 120 (or 100) across all packages.

## Release order

When shipping coordinated changes:

1. `ydsz-memory` (leaf — no sub-deps)
2. `ydsz-browser` (leaf — depends on memory only)
3. `ydsz-harness` (depends on browser + memory)
4. `ydsz-gateway` (independent of harness)
5. `ydsz-worker` (root — depends on all)

## CI checks

`.github/workflows/ci-versions.yml` runs on PRs that touch `pyproject.toml`
files and verifies dependency constraints parse without conflict.
