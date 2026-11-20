# Verification

- JavaScript syntax checks passed for app.js and pages.js.
- Generated standalone HTML for seven examples includes the safety wrapper and reduced-motion styles; every exported script parses successfully.
- Browser interaction checks: shared-element expansion, reversed list, grid/list switch, filtering to three results, tab selection, directional page content, and gallery swap all reached the completed transition state.
- Keyboard checks: arrow-key selection keeps focus on the selected demo tab; inspector tabs use roving keyboard focus.
- Fallback checks: Reduce motion and Simulate no API both apply the DOM change without animation.
- Cross-document check: page A navigates to page B and the return link restores the lab with timing preferences.
- Responsive checks at 390px: no horizontal overflow or clipped preview content in any of the eight experiments. Desktop layout also inspected.
- Console: no warnings or errors during the checked interactions.
- Red action surfaces use white text (4.65:1); small red text on paper uses a darker red shade.

Scope: tested in the available in-app browser, not a full cross-browser or screen-reader audit. Cross-document animation depends on browser support; normal links are preserved.

## Dark theme and vector logo branch

- Seven same-document demos reached their completed state in the dark palette.
- Theme control supports Space, retains focus, and exposes the dark-theme state with aria-pressed.
- Light preference survives reload; changing it on page B is reflected when returning to the lab.
- All eight preview patterns fit at 390px without clipping or horizontal overflow; header controls remain accessible.
- SVG logo and favicon parse as valid SVG; artwork uses theme variables.
- Copied examples are checked in both palettes for complete theme tokens and valid JavaScript.
- Main branch and the published Site remain the baseline while this branch is developed.

## Theme default and override

- Dark is applied before DOM readiness when no valid override is saved.
- Saved light and dark choices take precedence over the default, including after reload.
- Cross-tab preference changes are reflected; removing the override restores dark.
- Blocked storage keeps dark as the default and the user toggle works in memory.
- All 11 behavior scenarios pass in an isolated runtime with simulated storage states and events.

## Ten-experiment index

- Index and overview display 10; entries use two-digit numbering through 10.
- Circular reveal: signal state, left/center/right origins, Space activation, and reduced-motion fallback verified.
- Async content: old content stays visible while aria-busy is true; completion animates the prepared result.
- Simulated failure keeps the last result, clears busy state, and permits retry.
- Cancel returns focus to Run; leaving/resetting the experiment aborts preparation without a stale update.
- Reduced-motion and simulated-no-API paths still load data and update without animation.
- Both new scenes fit a 390px viewport without clipping or horizontal overflow.
- All nine same-document experiments complete successfully in the browser with no console warnings or errors.
- Standalone exports for all nine local examples parse and include complete theme tokens in both palettes.
- Async data is a local fixture with an explicit 450 ms simulated delay; no network service is implied.

## Arrow icons and text-only wordmark

- Hero progression arrows use three separate SVG paths with independent arrowheads and clear spacing.
- Capture, update, and continuity illustrations use a shared SVG icon set; the compressed brace/arrow text glyph is removed.
- All shared icon references resolve, and the sprite and typographic favicon parse as valid SVG.
- VT/LAB wordmarks use computed font weight 800; logo-mark SVGs and the registered trademark symbol are removed from all app headers and the footer.
- Updated icons and wordmark checked in both themes and at desktop/mobile widths; the 390px layout has no horizontal overflow.
- Shared-element demo still completes successfully; no console warnings or errors observed during the checked flow.
- Header metadata precedes the theme toggle in DOM order on all three pages; at 1280px the theme control is the rightmost element and still changes the theme.

## Preview animation containment

- Confirmed the live stage already uses overflow:hidden; named View Transition snapshots require their own overlay clip.
- During a 2000ms overshooting shared-element transition, the computed ::view-transition clip matches the preview’s outer border bounds and the animation stays inside the panel.
- All nine same-document demos animate with the preview clip active and complete without console warnings or errors.
- Scrolling and resizing skip the current animation and release the clip while preserving the committed state.
- The mobile clip matches the resized preview; reduced-motion updates do not leave clipping state behind.

- Border regression: the clip includes the entire demo-surface border box (not its inner content box). Grid/list transitions in both directions retain the frame during 2000ms overshoot animations.
