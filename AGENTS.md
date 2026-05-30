# AGENTS.md

## Cursor Cloud specific instructions

### Product

Single-package **WXT** browser extension (Manifest V3): **Open in Basic Window**. No backend, database, or Docker. End-to-end testing means building/loading the extension in a real browser and exercising the context menu.

### Dependency refresh (automatic)

On VM startup, run `npm install` from the repo root (see update script). Standard commands are in `README.md` and `package.json`.

### Lint / typecheck / build

| Task | Command |
|------|---------|
| Typecheck | `npm run compile` (`wxt prepare && tsc --noEmit`) |
| Production build (Chrome) | `npm run build:chrome` |
| Production build (Firefox) | `npm run build:firefox` |
| Dev watch + auto-open browser | `npm run dev:chrome` (also `dev:edge`, `dev:firefox`) |

There is no ESLint script in this repo; `npm run compile` is the main static check.

Outputs: dev → `.output/chrome-mv3-dev/`; production → `.output/chrome-mv3/` (and `firefox-mv3/` for Firefox). `.wxt/` and `.output/` are gitignored.

### Running the dev server

Use **tmux** for long-running WXT dev (e.g. session `wxt-dev-chrome`):

```sh
cd /workspace && npm run dev:chrome
```

WXT serves the dev UI (typically `http://localhost:3001`) and rebuilds on file changes. It may auto-launch Chrome with the dev build.

### Manual Chrome testing (Cloud VM)

Google Chrome is available as `/usr/local/bin/google-chrome`.

- **`--load-extension` is unreliable** in this environment; prefer **Developer mode → Load unpacked** and select the build directory (use `/tmp/...` if the file picker hides dot-directories like `.output`).
- Copy builds to a visible path when needed: `cp -r .output/chrome-mv3 /tmp/chrome-ext-load`
- **`file://` test pages** work when outbound HTTPS is blocked; enable **Allow access to file URLs** on the extension details page if testing locally.
- Ubuntu’s `firefox` package is a **snap stub** (`/usr/bin/firefox` → requires snap); Firefox E2E is not available unless you install a standalone Firefox binary another way.

### Chrome dev-build gotcha (stock repo)

On Chrome, `contextMenus.create` rejects the `"tab"` context (see Chrome extension API). The stock `getMenuContexts()` in `entrypoints/background.ts` includes `"tab"` for non-Firefox browsers, so the **service worker throws on install** and the context menu never appears. Symptom in DevTools: `TypeError` at `contexts` index 6 (`tab`). Firefox uses the `menus` API where `"tab"` is valid. When validating the environment only, a one-off patched copy under `/tmp` (omit `"tab"` from contexts in the built `background.js`) is enough to prove the toolchain and popup-window behavior.

### Hello-world E2E (Chrome)

1. `npm install && npm run build:chrome`
2. Load `.output/chrome-mv3` (or patched copy) unpacked in Chrome.
3. Open a page with an `https://` link, right-click the link → **Open in Basic Window**.
4. Confirm a **popup** window opens with the target URL.
