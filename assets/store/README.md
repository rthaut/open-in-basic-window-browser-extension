# Store Assets

Durable source and exported assets for browser-store listings.

Generate the editable promo image and README hero sources/exports with:

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

Screenshots should be real browser captures stored under browser-specific folders in `screenshots/`. They should show actual extension behavior:

- Context menu with the extension action; literal captures should show the target-specific "Open [Target] in Basic Window" item.
- Resulting popup-style browser window.
- Representative link, image/media, and page/tab behavior.
- Firefox-only bookmark and container-preservation behavior where practical. Do not show bookmark context-menu support or container identity preservation in Chrome or Edge assets.

Keep captured screenshots in browser-specific folders so future releases can update store listings consistently.

## Captured Screenshots

Chrome:

- `screenshots/chrome/01-chrome-link-1280x800.png`
- `screenshots/chrome/02-chrome-popup-window.png`
- `screenshots/chrome/03-chrome-image-1280x800.png`

Microsoft Edge:

- `screenshots/edge/01-edge-link-1280x800.png`
- `screenshots/edge/02-edge-popup-window-result.png`
- `screenshots/edge/03-edge-image-1280x800.png`

Firefox:

- `screenshots/firefox/01-firefox-link-1280x800.png`
- `screenshots/firefox/02-firefox-popup-window-result.png`
- `screenshots/firefox/03-firefox-image-1280x800.png`
- `screenshots/firefox/04-firefox-tab-1280x800.png`
- `screenshots/firefox/05-firefox-bookmark-1280x800.png`

## Generated Asset Pack

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

- Promo images and the README hero are polished generated assets built from the extension's real icon and documented behavior.
- Store screenshots should be captured from real browser UI rather than generated.
- Re-run `npm run generate:store-assets` after changing the icon, listing copy, or asset layout script.
- The generator wraps and scales annotated text blocks to avoid obvious text overflow. Use `npm run check:store-assets` after copy or layout changes.
