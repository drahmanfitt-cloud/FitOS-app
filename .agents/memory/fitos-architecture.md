---
name: FitOS architecture
description: How the FitOS personal-trainer app is wired (backend, deploy, styling, data-model conventions).
---

FitOS is a React+Vite personal-trainer fitness web app.

- **Backend**: a shared Supabase project accessed with the **anon key only**. No DDL, no service-role. The user runs SQL migrations manually via `supabase_setup.sql`. The agent must NOT attempt to run migrations or create tables programmatically.
- **Deploy**: GitHub → Netlify auto-deploy on push.
- **Styling**: dark UI; all color tokens live in `src/config.js` as the `C` object (e.g. `C.purple`, `C.teal`, `C.blue`, `C.green`, `C.text`, `C.sub`, `C.muted`, `C.border`, `C.surface`, `C.s2`, `C.s3`).
- **Data-model convention**: each entity has a `mapX` mapper in `config.js` (e.g. `mapWorkout`) and a `fitos_<entity>` table. `db` helper exposes `select/insert/delete`; writes are batched via `queueWrite`.

**Graceful degradation rule (important):** when adding a new table, load it in its OWN try/catch in App.jsx `loadAll`/`reload` so a missing table (migration not yet run by the user) never breaks app boot. CRUD insert failures should surface a "run the migration" toast rather than throwing. This is the established pattern — follow it for any new table.

**Component shape reuse:** program "days", standalone "workouts", and logged sessions all share the same exercise shape `{id,name,sets,reps,rest,notes}`, so copy-into-day and session-loading logic is reused across `programs.jsx` (ProgramBuilder/WorkoutBuilder) and `session.jsx` (SessionLogger). Warmup items are reused via `WarmupPlanner`/`WarmupSection` (warmup.jsx).
