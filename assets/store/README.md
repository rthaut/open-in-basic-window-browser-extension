# Store Assets

Durable source and exported assets for browser-store listings.

Generate the editable SVG sources and exported PNGs with:

```sh
npm run generate:store-assets
```

Regenerate the assets and run the built-in approximate text-fit checks with:

```sh
npm run check:store-assets
```

Related capture workflow:

- For literal browser screenshots, follow [`docs/screenshot-capture-guide.md`](../../docs/screenshot-capture-guide.md).
- For the local screenshot fixture used by that guide, run `npm run serve:screenshot-demo`.

## Required Before Submission

- Chrome Web Store screenshots.
- Chrome Web Store promotional images, if required by the listing flow.
- Microsoft Edge Add-ons screenshots.
- Microsoft Edge Add-ons promotional images, if required by the listing flow.
- Firefox Add-ons screenshots.
- Firefox Add-ons listing images, if used.

## Screenshot Guidance

Screenshots should show actual extension behavior:

- Context menu with "Open in Basic Window".
- Resulting popup-style browser window.
- Representative link, image/media, and page/tab behavior.
- Firefox-only bookmark and container-preservation behavior where practical. Do not show bookmark context-menu support or container identity preservation in Chrome or Edge assets.

Keep editable source files and exported images in this directory so future releases can update listing assets consistently.

## Generated Asset Pack

Screenshots:

- `screenshots/01-context-menu-link-1280x800.png`
- `screenshots/02-popup-window-result-1280x800.png`
- `screenshots/03-firefox-bookmark-container-1280x800.png`
- `screenshots/04-local-privacy-1280x800.png`

Promotional images:

- `promo/chrome-small-440x280.png`
- `promo/edge-small-440x280.png`
- `promo/firefox-small-440x280.png`
- `promo/chrome-marquee-1400x560.png`
- `promo/edge-marquee-1400x560.png`
- `promo/firefox-marquee-1400x560.png`

Chrome and Edge promotional images should describe link, media, tab, frame, and page support only. Firefox promotional images may also mention bookmarks and container-aware popup behavior.

Editable SVG sources are stored under `source/` with matching names.

## Notes

- These are polished listing assets generated from the extension's real icon and documented behavior.
- If a store reviewer requires literal browser captures instead of designed screenshots, replace or supplement these with real captures before submission.
- Re-run `npm run generate:store-assets` after changing the icon, listing copy, or asset layout script.
- The generator wraps and scales annotated text blocks to avoid obvious text overflow. Use `npm run check:store-assets` after copy or layout changes.
