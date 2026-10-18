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

## System color preference

- Initial light and dark system preferences are applied before DOM readiness when no valid override is saved.
- Saved light and dark choices take precedence over the system, including after reload.
- Live system changes update the theme only while there is no explicit override.
- Cross-tab preference changes are reflected; removing the override or clearing storage resumes system following.
- Blocked storage preserves system detection and an in-memory user override for the current page.
- All 11 behavior scenarios pass in an isolated runtime with simulated system preferences and storage events.

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
