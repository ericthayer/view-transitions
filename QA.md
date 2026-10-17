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
