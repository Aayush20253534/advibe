# Testing baseline

Source: `d2ac1f3`, 7 November 2026. Runtime: Linux x64, Node 24.22.1; repository CI uses Node 22. Fresh checkout has no dependency lockfiles.

| Check | Actual initial result |
| --- | --- |
| `node --test tests/*.test.mjs` | 138 tests, 136 passed, 2 failed |
| `node --test backend/tests/api-route-inventory.test.mjs` | 1 passed |
| Frontend lint/type/build | Pending dependency install; not yet claimed |
| Backend lint/type/unit/build | Running after isolated dependency install |
| Database integrations | Pending disposable local PostgreSQL; never use live Neon |
| Browser/performance | Not run at audit checkpoint |
| Provider sandbox | Not run; no provider credentials supplied |

Initial failing tests are in `tests/part22-integration.test.mjs`: a stale orange CTA assertion after the blue redesign, and a focus-return regex requiring obsolete whitespace. The focus-return behavior exists in current source. Preserve the intent with current contrast checks and whitespace-independent assertions, then verify actual behavior in browser.

Historical M9 results are historical evidence only. Current verification is recorded separately, including skipped or blocked checks.
