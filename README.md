# VT/LAB

An interactive field guide to the native Web View Transitions API. Built with HTML, CSS, and JavaScript, with no application dependencies or build step.

## Preview

From this directory: `python3 -m http.server 4173 --directory dist`

Open http://localhost:4173. The two-document experiment uses page-a.html and page-b.html on the same origin.

## Experiments

Ten experiments cover shared elements, list reorder, grid/list layout, filtering, accessible tabs, directional paging, gallery swapping, cross-document navigation, circular snapshot reveals, and async content preparation.

Code copies for experiments 1–7 and 9–10 include a standalone HTML example, styles, and a reduced-motion-aware feature-detection wrapper. Cross-document copying provides CSS to include in both pages.

The circular reveal uses a named snapshot and custom clip-path keyframes, with selectable origins. The async example uses a clearly labeled local fixture with 450 ms simulated latency; no network service is required. It preserves the current view during preparation, supports cancellation and failure/retry, and starts the transition only after data is ready.

## Accessibility and fallback

System reduced motion takes priority over the lab controls. No-API simulation runs the same DOM update immediately. Keyboard-operable controls, roving tab focus, state attributes, and live status messages accompany the demos. Cross-document navigation uses ordinary links and CSS opt-in on both pages.

## Source

Content links to MDN, Chrome developer documentation, and relevant CSS-Tricks reading. Individual examples link to the relevant references. Browser support is detected for the same-document API, not inferred for cross-document navigation.

## Themes and logo

The initial theme follows the system color preference. Use the theme button in the header to choose dark or light; that explicit choice is saved locally under `vt-lab-theme` and takes precedence over the system on subsequent visits. The theme is resolved before the stylesheet paints on all three pages. Without an override, changes to the system preference update the page automatically. If storage is unavailable, the system preference and the toggle still work on the current page.

Theme tokens live in `dist/style.css`; the dark palette is scoped to `:root[data-theme="dark"]`. Demo artwork uses those tokens, and copied standalone examples include the currently selected palette.

The custom **Offset Viewports** mark uses two offset geometric frames to represent the before and after views. Its vector paths are used in the header and footer, both navigation-demo pages, and the favicon. `dist/logo-mark.svg` is the standalone vector asset.

## Publishing

The Sites source workflow versions this folder. `.openai/hosting.json` declares `dist` as the static root. No secrets or runtime data are required.
