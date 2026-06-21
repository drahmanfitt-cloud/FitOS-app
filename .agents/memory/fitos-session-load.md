---
name: FitOS session load semantics
description: Invariant for the SessionLogger "load" actions that populate a session from a source.
---

`SessionLogger` (src/session.jsx) can populate a session from multiple sources: `loadFromDay` (program day) and `loadFromWorkout` (standalone workout). There may be more in future.

**Rule:** every `loadFrom*` action must fully and deterministically set ALL source-derived session state, not just the fields it cares about. Specifically each must set `name`, `programDay`, `warmup`, and `exercises`. A loader that sets only a subset leaves stale state from a previous load, producing mixed/incorrect saved sessions (e.g. a workout's warmup lingering under a program-day label).

**Why:** a real bug shipped where `loadFromWorkout` didn't clear `programDay` and `loadFromDay` didn't replace `warmup`, so loading one source after the other saved wrong attribution/content.

**How to apply:** when copying exercises or warmup into session state, always remap ids with `uid()` (fresh ids) to avoid React-key collisions and shared object refs. `programDay` is the program-day tag — set it to the day label for `loadFromDay`, and clear it (`""`) for any non-program-day loader.
