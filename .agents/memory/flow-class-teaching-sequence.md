---
name: Flow-class teaching sequence (yoga/mobility)
description: How warmup items + poses merge into one re-orderable Lead Class flow for yoga & mobility
---

Yoga & Mobility class formats ("flow" types, `classType==="yoga"||"mobility"`) weave the format's warmup items (`fmt.warmup`, shared across class types) together with that type's poses (`fmt.stations` filtered by classType) into ONE re-orderable teaching sequence. HIIT and the rotation/station-timer mode are deliberately unchanged.

**Ordering model:** a shared numeric `seq` field lives on BOTH warmup items and station items. The merged list is sorted by `seq`; items without `seq` (legacy) fall back to warmup-first-then-poses via a stable index tiebreak. Reorder writes `seq=index` back across both arrays in a single `upd()` call.
**Guard:** the reorder/delete map only contains IDs in the current merged set, so `m[id]!=null` prevents touching stations of OTHER class types. Warmup `seq` is shared, so its position is relative to whichever flow tab is open — acceptable edge case if one format mixes yoga+mobility.

**Lead view normalization (programs.jsx → leadSequence):** warmup items are reshaped into the pose shape FollowAlongDisplay expects — `category "foam-rolling"→"foam"`, `notes→description`, keep holdSec/sidesMode, add a category icon. Poses get `holdSec = holdSec||workSec` so the hold timer shows, and `description = it.description || it.notes || ""` (NEVER `it.notes||""` alone — that erases existing pose descriptions).

**Display (display.jsx FollowAlongDisplay):** `isFlow=yoga||mobility` drives the hold-based layout (same branch yoga used). `accent = mobility?teal : yoga?purple : green`. Flow classes open on an agenda/overview early-return screen gated by `started` state (defaults `!isFlow`); "Start Class" / tapping an agenda row sets started. A "≡ Agenda" button returns to it. PoseTimer takes an `accent` prop for the ring.

**Why:** trainer wanted to teach warmup (stretching/mobility/foam-rolling) inline within the guided Lead Class for yoga/mobility, reorderable freely, with an agenda shown first.
