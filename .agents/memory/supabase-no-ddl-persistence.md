---
name: Supabase no-DDL graceful-degrade persistence
description: How FitOS adds new persisted client fields when only the anon key is available (no DDL/service-role)
---

# Adding new persisted fields without DDL access

FitOS connects to a shared Supabase with the **anon key only** — the agent cannot run `ALTER TABLE` / create columns. When a feature needs a new column, use this pattern:

1. **Reads must default safely.** In `mapClient` (and siblings) map missing columns to a default (`r.goals||[]`, `r.bodyweight_log||[]`). This guarantees loads never break even before the column exists.
2. **Writes are optimistic + graceful-degrade.** The update handler sets local state first (`setClients` + `setActiveClient`), then `await db.update(...)` inside a `try/catch`. On failure show a toast telling the user the column is missing. In-session UI works; it just doesn't persist until the column exists.
3. **Hand the user the one-line SQL** to run themselves in Supabase, e.g.:
   `alter table fitos_clients add column if not exists goals jsonb default '[]', add column if not exists bodyweight_log jsonb default '[]';`

**Why:** No service-role/DDL access from the dev environment, and the DB is shared production — writing test data or schema from here is not allowed. This pattern keeps the app crash-free pre-migration and self-heals once the user applies the SQL.

**How to apply:** Use whenever a task introduces a new persisted client/session/etc. field. Column names in `db.update` must be snake_case DB names (e.g. `bodyweight_log`), while app state uses camelCase (`bodyweightLog`).

## Known fields added via this pattern
- `fitos_clients`: `goals` jsonb, `bodyweight_log` jsonb.
- `fitos_classes`: `focus` text (per-class focus label), `series_id` text (groups recurring occurrences). Recurring classes are stored as one row per occurrence (no recurrence-rule column); `series_id` ties them together. Migration: `alter table fitos_classes add column if not exists focus text, add column if not exists series_id text;`
- `fitos_formats`: `warmup` jsonb (per-format warmup/mobility plan, edited in the ClassFormatBuilder WarmupPlanner above the stations). Migration: `alter table fitos_formats add column if not exists warmup jsonb default '[]';` NOTE: warmup is sent only via `update` (not in `addFormat`'s insert) to avoid the insert-fails gotcha; new formats start with `[]`.

## Debounced writes + missing-column graceful degrade (queueWrite)
`updateProgram`/`updateFormat` are optimistic + debounced via `queueWrite(table,id,patch,opts)` in App.jsx (coalesces fast edits into one PATCH ~500ms after typing stops). For a not-yet-migrated column, pass `opts.optionalKeys:["warmup"]` (+ optional `degradeMsg`): on a missing-column error the writer strips those keys and retries so the rest of the record still saves, then toasts the user. **Why:** a single combined PATCH means one unknown column would otherwise fail ALL field saves; strip-and-retry keeps core edits persisting pre-migration while the value lives in optimistic local state.

## Insert vs update on a missing column (key gotcha)
Unlike `update` (which can silently degrade), an **`insert`/`insertMany` with an unknown column fails the entire write**. So insert handlers must catch the missing-column error and retry with the extra columns stripped, then toast the user to run the migration. Reason: PostgREST rejects the whole payload, so without the retry the core record (e.g. a class) would never be created pre-migration.
