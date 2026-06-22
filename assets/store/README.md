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

## Public Listings

Verified published on June 22, 2026:

- [Chrome Web Store](https://chromewebstore.google.com/detail/open-in-basic-window/kplohddcajpgkdgdnjgkcaddmcdihbjn) for version 1.0.0.
- [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/open-in-basic-window/lgjbddojadnfkmodoggeiceipknajjgj).
- [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/open-in-basic-window/) for version 1.0.0.

## Submission Checklist

- [x] Chrome Web Store screenshots.
- [x] Chrome Web Store promotional images.
- [x] Chrome Web Store listing published.
- [x] Microsoft Edge Add-ons screenshots.
- [x] Microsoft Edge Add-ons promotional images.
- [x] Microsoft Edge Add-ons listing published.
- [x] Firefox Add-ons screenshots.
- [x] Firefox Add-ons listing images.
- [x] Firefox Add-ons listing published.

## Screenshot Guidance

Screenshots should be real browser captures stored under browser-specific folders in `docs/media/screenshots/`. They should show actual extension behavior:

- Context menu with the extension action; literal captures should show the target-specific "Open [Target] in Basic Window" item.
- Resulting popup-style browser window.
- Representative link, image/media, and page/tab behavior.
- Firefox-only bookmark and container-preservation behavior where practical. Do not show bookmark context-menu support or container identity preservation in Chrome or Edge assets.

Keep captured screenshots in browser-specific folders so future releases can update store listings consistently.

## Captured Screenshots

Chrome:

- `docs/media/screenshots/chrome/01-chrome-link-1280x800.png`
- `docs/media/screenshots/chrome/02-chrome-popup-window.png`
- `docs/media/screenshots/chrome/03-chrome-image-1280x800.png`

Microsoft Edge:

- `docs/media/screenshots/edge/01-edge-link-1280x800.png`
- `docs/media/screenshots/edge/02-edge-popup-window-result.png`
- `docs/media/screenshots/edge/03-edge-image-1280x800.png`

Firefox:

- `docs/media/screenshots/firefox/01-firefox-link-1280x800.png`
- `docs/media/screenshots/firefox/02-firefox-popup-window-result.png`
- `docs/media/screenshots/firefox/03-firefox-image-1280x800.png`
- `docs/media/screenshots/firefox/04-firefox-tab-1280x800.png`
- `docs/media/screenshots/firefox/05-firefox-bookmark-1280x800.png`

## Generated Asset Pack

Promotional images:

- `promo/chrome-small-440x280.png`
- `promo/edge-small-440x280.png`
- `promo/firefox-small-440x280.png`
- `promo/chrome-marquee-1400x560.png`
- `promo/edge-marquee-1400x560.png`
- `promo/firefox-marquee-1400x560.png`

Chrome and Edge promotional images should describe link, media, tab, frame, and page support only. Firefox promotional images may also mention bookmarks and container-aware popup behavior.

Editable store SVG sources are stored under `source/` with matching names. The README hero SVG source is stored separately under `../readme/source/`.

## Notes

- Promo images in `assets/store/` and the README hero in `docs/media/readme/` are polished generated assets built from the extension's real icon and documented behavior.
- Generator-only source materials stay under `assets/` so `docs/` only contains published artifacts.
- Store screenshots should be captured from real browser UI rather than generated.
- Re-run `npm run generate:store-assets` after changing the icon, listing copy, or asset layout script.
- The generator wraps and scales annotated text blocks to avoid obvious text overflow. Use `npm run check:store-assets` after copy or layout changes.
