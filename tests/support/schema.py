"""Canonical schema version assertion for the test suite.

Adding a migration pair (``00N_description.sql`` + ``00N_description.pg.sql``)
must be accompanied by bumping this single constant.  Tests that need to assert
the applied watermark import it instead of hard-coding a number — hard-coded
copies silently drift when a migration lands without updating every caller
(022 landed with seven tests still asserting 21).

Keep this in sync with the highest-numbered migration file in
``src/ydsz/infra/db/migrations/``.
"""

from __future__ import annotations

EXPECTED_SCHEMA_VERSION = 22
