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
