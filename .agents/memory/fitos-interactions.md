---
name: FitOS interaction preferences
description: User-requested consistency for hover feedback and weight preferences.
---

The user wants everything to highlight on hover, specifically including workout cards, the repeat button, and all Training Intelligence panels and controls.
**Why:** The user requested the same border feedback as other app bubbles.
**How to apply:** Give new cards and interactive controls consistent border highlighting and keyboard focus feedback, without making static text look clickable.

Training Intelligence's outer section border and the whole time-range selector border should be much fainter than the inner highlights; individual time buttons stay unchanged.
**Why:** The user explicitly requested less prominent container outlines.
**How to apply:** Keep container hover borders subtle while retaining the inner panel and individual button feedback.

Condensing Customize dashboard includes its top-right trigger, not only the expanded reorder controls. The four dashboard metric cards should highlight individually on hover and return to neutral afterward.
**Why:** The user clarified that the top-right control still looked unchanged and reported missing hover feedback.
**How to apply:** Keep the trigger compact and verify hover enter/leave on the actual metric cards.

The profile default weight preference must use a kg/lbs toggle like Session Settings, not a dropdown.
**Why:** The user explicitly corrected the initial dropdown design.
**How to apply:** Preserve the matching toggle when revising My Profile.

Upcoming Classes, Recent Sessions, and Active Clients dashboard containers should highlight only while the cursor is on the card, returning to neutral on leave.
**Why:** The user reported borders remaining highlighted after the cursor left.
**How to apply:** Use hover-only CSS for these containers rather than persistent inline border changes or focus-within highlights.

Screen-to-screen navigation should feel fluid rather than switch abruptly.
**Why:** The user requested smoother transitions between screens.
**How to apply:** Keep navigation motion subtle and quick, respect reduced-motion settings, and preserve in-progress sessions.
