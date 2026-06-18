---
name: Cross-module helper import crashes
description: FitOS recurring runtime crash class — helpers used in a module but never imported/exported
---

# Recurring "Can't find variable: X" crashes

FitOS has hit this several times: a shared helper is referenced in one module but
not imported there (and sometimes not exported from its source module). It compiles
fine (Vite doesn't error on undeclared globals) and only crashes at runtime when the
component renders, surfacing as "Can't find variable: X" caught by an ErrorBoundary
("Something went wrong").

Known offenders fixed: `modeFor` (defined in `clients.jsx`, used in `session.jsx`),
`fmtTime` (exported from `config.js`, not imported in `clients.jsx`).

**Why:** helpers live in `config.js` (fmt*, uid, now, clamp, db, map*), `clients.jsx`
(modeFor, RESISTANCE_MODES, DEFAULT_SETTINGS, Toggle, ResistanceToggle), `ui.jsx`
(Btn, Pill, etc.). They get used across modules; the import line is easy to forget.

**How to apply:** after adding/moving any cross-module helper usage, verify it's both
exported from its source and imported in the consuming file. Quick check:
`rg -n "helperName" src/` and confirm an import line exists in each consumer.

Note: HMR "Could not Fast Refresh (... export is incompatible)" warnings are benign —
these files intentionally mix component + non-component exports. Not the bug; ignore.
