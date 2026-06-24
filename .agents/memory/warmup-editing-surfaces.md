---
name: Warmup editing surfaces
description: Where warmup/mobility protocols are edited and how items are added
---

There are THREE real warmup-editing surfaces that must stay consistent; a change to one usually wants mirroring in the others:
- `WarmupSection` in `src/session.jsx` (Log Session — has live timers).
- `WarmupPlanner` in `src/warmup.jsx` (Class Format builder, above stations — planning only).
- `ProgramWarmupTab` in `src/programs.jsx` (Program builder warmup tab — planning only).

**Trap:** `src/warmup.jsx` also defines its OWN `ProgramWarmupTab` + `ProgramBuilderPreview` — these are DEAD demo/preview code (never rendered). Don't confuse them with the real `ProgramWarmupTab` in `programs.jsx`. Edit the programs.jsx one.

Adding warmup items uses a lookup picker (`WarmupPicker` in warmup.jsx), not free-typed names — mirrors the exercise `ExPicker`. It searches `WARMUP_LIBRARY` (keyed by category: stretching/mobility/foam-rolling/sport) and allows a custom typed name. Session passes category `"sport-specific"`; the picker normalizes that to the `sport` library key. **Why:** user wanted warmups to be looked up like exercises, not typed.

**Custom warmups persist to the catalog** (like custom exercises): WarmupPicker takes `catalog` + `onAddToCatalog`; on custom add it calls `onAddToCatalog(name, meta)` where meta comes from `WARMUP_CATALOG_META` (keyed by normalized category key). The picker also merges catalog rows whose `purpose` matches that category into its suggestion list (catalog-first dedupe), so a saved custom resurfaces next time. `WARMUP_CATALOG_META` MUST mirror `WARMUP_GROUPS` in seedLibrary.js (purpose/category/equipment) so customs match seeded warmups; the purpose is the join key for resurfacing. App.jsx `quickAddCatalog(name, meta={})` applies meta.category/equipment/purpose (defaults Strength/Other/"" for plain exercises — backward compatible). Threaded via `WarmupPlanner` (programs.jsx 3 call sites) and `WarmupSection` (session.jsx). **Why:** user wanted custom warmup movements saved so they pop up again like Exercises do.

## Warmup movements also live in the Exercise Catalog
The same WARMUP_LIBRARY movements are mirrored into the catalog via `WARMUP_SEED` (generated in `src/seedLibrary.js` by importing WARMUP_LIBRARY from warmup.jsx — single source of truth for names). They carry a `purpose`: stretching→"Stretch", mobility→"Mobility", foam-rolling→"Foam Rolling" (names suffixed " Foam Roll"), sport→"Sport Specific". Catalog cards render a colored dot on the right edge keyed by purpose (WARMUP_DOT_PURPOSES in catalog.jsx) — colors match WARMUP_CATS (purple/teal/blue/amber).
**Sync trap:** WARMUP_SEED is deduped against SEED_LIBRARY by name before being folded in, and the App.jsx load effect tops up existing catalogs once (guarded by localStorage `fitos_warmup_seeded` + warmupSeededRef) so warmups appear without re-adding on every load or fighting user deletions.
**Why:** user wanted every warmup movement in the catalog in one place, color-labeled, without duplicates.
