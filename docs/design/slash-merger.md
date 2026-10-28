# Slash Command System — Merger Design

## Current state

There are **three** slash command implementations in the Ydsz monorepo, independently
evolved for different contexts but substantially overlapping in intent.

| Location | Files | Primary role |
|----------|-------|--------------|
| `harness/src/ydsz_harness/slash/` | 5 files (`core.py`, `dispatcher.py`, `handlers.py`, `runtime.py`) | **In-harness** — slash commands intercepted inside the agent's SOUL loop (e.g. `/think`, `/verbose`, `/mode`) |
| `src/ydsz/infra/gateway/slash/` | 11 files + `handlers/` | **Pre-harness** — slash commands handled *before* message reaches agent (e.g. `/new`, `/history`, `/expert`) |
| Harness `middleware/turn_model.py`, `conversation_mode.py` | — | Minor pattern detection coupled to slash concepts |

## What each does

### Harness slash (`ydsz_harness/slash/`)

- Parses `/think`, `/verbose`, `/mode`, `/stream` from the raw user text *inside* the agent loop.
- These change the agent's runtime behavior mid-conversation (toggle thinking depth, verbosity, output format).
- Has its own `SlashCommand` dataclass, `BufferSink` for capturing output, and a `Dispatcher`.
- Dispatches to handler functions keyed by command name.

### Gateway slash (`infra/gateway/slash/`)

- Parses `/new`, `/history`, `/expert`, `/help`, `/status` at the **IM ingress** layer.
- These manage *sessions* and *routing* — resetting conversation, switching experts — without involving the harness.
- Richer feature set: catalog with descriptions + i18n, `catalog.py`, `formatting.py`, `runner.py`.
- Tied to thread/session lifecycle (`handlers/session.py`, `handlers/platform.py`).

## Why merging matters

1. **Bug fixes need to land in 2 places.** A parsing edge-case or i18n fix in one
   slash parser doesn't propagate to the other.
2. **Two `SlashCommand` types** with identical fields exist in the same codebase.
3. **The harness version is a subset** — everything it does could be expressed as
   pre-harness routing (with a "passthrough to harness" mode for runtime toggles).

## Proposed architecture

```
Gateway slash  ──── handles ────►  session-level commands (/new, /history, /expert, ...)
                                        │
                                        ▼  (passthrough for in-loop commands)
Harness slash  ──── handles ────►  runtime-level commands (/think, /verbose, /mode, ...)
```

**Merge strategy: absorb harness slash into gateway slash.**

The gateway `infra/gateway/slash/` is the more complete implementation (catalog,
i18n, runner, handlers). The harness slash should become a **passthrough target**:
1. Gateway parser detects a command.
2. If it's a gateway-owned command (session mgmt / help), execute locally.
3. If it's a harness-owned command (runtime toggle), forward to the harness runtime.
4. Harness's `slash/core.py` `parse_slash` + `Dispatcher` types become thin re-exports
   of the canonical gateway types (or are deleted entirely).

## Migration phases

| Phase | Description | Risk |
|-------|-------------|------|
| **Phase 1** | Move harness slash types (`SlashCommand`, `SlashSink`, `parse_slash`) to gateway package; harness re-imports them. | Low — pure refactor |
| **Phase 2** | Gateway dispatcher gains a `passthrough_to_harness` route; harness registers its commands (think, verbose, mode). | Medium — behavior change |
| **Phase 3** | Delete `harness/src/ydsz_harness/slash/`; update all harness imports to gateway paths. | Low — already tested |

## Open questions

- Are there slash commands that *must* act inside the harness loop and cannot be
  pre-routed? (`/think` likely needs harness visibility.)
- Do we need a "slash command registry" where both sides declare
  their commands, and the parser auto-routes based on ownership?
- Should the merged slash system be moved to `ydsz-gateway` package (as it's
  fundamentally an IM/ingress feature) or stay in root `src/ydsz/infra/`?

## Recommendation

1. Default: **move canonical types + parser to gateway**, keep harness as passthrough.
2. Create a `SlashRegistry` protocol that both sides implement for self-registration.
3. Run Phase 1 as a small PR (~200 lines), confirm no regressions before Phase 2.

---

*Estimated effort: 2-3 days across 3 PRs (one per phase).*
