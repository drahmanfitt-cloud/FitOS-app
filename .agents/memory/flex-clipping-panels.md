---
name: Flex column panel clipping
description: Why collapsible panels with overflow:hidden get clipped inside scrollable flex columns, and the required guard
---

# Collapsible panels clipped inside scrollable flex columns

Rule: any panel styled with `overflow:"hidden"` (used for rounded corners) that is a direct child of a `display:flex; flexDirection:column` container must also set `flexShrink:0`.

**Why:** CSS flexbox gives items with `overflow` other than `visible` an automatic min-size of 0, so when the column's content exceeds its height (e.g. inside an `overflowY:auto` editor pane with a fixed viewport height), that panel silently shrinks below its content height and `overflow:hidden` clips its contents mid-item. Sibling cards with visible overflow refuse to shrink, so only the hidden-overflow panel appears "cut off" — which looks like a data bug but is pure layout.

**How to apply:** This app's editor panes (Workouts tab, program builder, session logger) are scrollable flex columns. Whenever adding a new rounded/collapsible panel there, include `flexShrink:0` in its root style. Symptom to recognize: a section renders its header plus the first item or two, then ends abruptly while later siblings render fully.
