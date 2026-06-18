---
name: ClassFormatBuilder per-type station lists
description: How HIIT/Yoga/Mobility class types keep separate item lists without a DB migration, and the totalDuration pitfall.
---

# Per-type station lists in ClassFormatBuilder (src/programs.jsx)

A class format supports multiple `classType`s (hiit / yoga / mobility), each with its
own list of items (Station / Pose / Movement). These are NOT stored in separate
columns. Every entry in the existing `fmt.stations` jsonb array carries a
`classType` field; the active list is derived by `stations.filter(s => (s.classType||"hiit")===classType)`.

**Why:** Shared Supabase, anon key only — no ALTER TABLE allowed. Tagging within the
existing array gives per-type lists with zero migration and stays backward compatible
(legacy untagged rows fall back to "hiit").

**How to apply:**
- Add/move/remove operate on the full `allStations` array but scope to the active
  type. `mvSt` reorders within the active type by swapping the two relevant IDs in the
  full array, so other types' order is untouched.
- The active `classType` toggle is intentionally NOT persisted; it defaults to "hiit"
  on reopen, but all tagged data is preserved.
- CLASS_TYPES config (module-level) drives labels (item/items/empty/lead/toggle),
  accent color, and whether the Station Timer shows (hiit only).
- Yoga follow-along previously used a separate always-empty `yogaPoses` state (bug —
  showed nothing); it now uses the tagged active list like every other type.

**totalDuration pitfall:** persisted `totalDuration` must be computed across ALL
stations (`calcMin(merged.stations, merged)`), NOT the active-type-filtered list.
If you filter by the active `classType` inside `upd()`, then editing name/description
while a non-default type tab is open silently rewrites the saved duration, and the
format list card (which renders the persisted value) shows stale/mismatched minutes.
The live in-builder "Total (min)" box may still show the active type's minutes.
