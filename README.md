# Open in Basic Window

A small WXT-powered Manifest V3 browser extension that adds a context-menu item for opening supported targets in a popup-style browser window.

Chrome and Edge support links, images, videos, audio, frames, pages, and tabs. Firefox supports those contexts plus bookmarks.

## Supported Contexts

- Links
- Images
- Videos
- Audio
- Frames
- Pages
- Tabs
- Firefox bookmarks

Firefox builds preserve the source tab's contextual identity when the clicked item is tied to a tab and Firefox exposes a `cookieStoreId`. Chrome and Edge builds support the same tab/page/media/link/frame behavior, but do not support Firefox contextual identities.

## Privacy

This extension does not collect, store, transmit, or sell user data. All behavior happens locally through browser extension APIs.

## Permissions

- `contextMenus` / `menus`: Add the right-click menu item.
- `tabs`: Read the source tab URL and preserve tab context when opening a popup window.
- `bookmarks` in Firefox: Resolve bookmark URLs for Firefox bookmark context-menu support.
- `cookies` and `contextualIdentities` in Firefox: Preserve Firefox container identity for supported source tabs.

## Development

Install dependencies:

```sh
npm install
```

Run a development build:

```sh
npm run dev:chrome
npm run dev:edge
npm run dev:firefox
```

Create production builds:

```sh
npm run build:chrome
npm run build:edge
npm run build:firefox
```

Create extension ZIPs:

```sh
npm run zip:chrome
npm run zip:edge
npm run zip:firefox
```

Generated WXT files are written to `.wxt/`, and build artifacts are written to `.output/`. Both directories are intentionally ignored by git.
