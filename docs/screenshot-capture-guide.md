# Screenshot Capture Guide

Use this guide if browser stores require literal screenshots, or if you want to supplement the generated assets in `assets/store/` with real captures.

Open in Basic Window is intentionally utility-focused and has no flashy in-extension UI. Good screenshots should therefore make the workflow obvious: **right-click a supported target, choose "Open in Basic Window", and see the target open in a focused popup-style window.**

## Goals

- Show the extension solving a recognizable problem in one glance.
- Keep browser chrome clean enough that the context-menu action is the focal point.
- Use real browser UI where possible, but stage the page and windows intentionally.
- Capture the extension's strongest differentiators:
  - link/media/page/tab support
  - popup-style window result
  - Firefox-only bookmark support
  - Firefox container preservation
  - no-data, local-only privacy posture

## Recommended Capture Sizes

Capture at a larger working size, then crop/export to store-specific sizes.

Recommended working sizes:

- Primary screenshots: `1280x800`
- Alternate wide screenshots: `1366x768`
- High-resolution source captures: `2560x1600` on a 2x display, exported down to `1280x800`

Recommended final export:

- Use PNG.
- Keep screenshots landscape.
- Keep text readable at store-gallery thumbnail sizes.
- Avoid tiny browser UI details as the only proof of functionality.

Before submission, verify current requirements in each store dashboard because exact minimums and optional promotional slots can change.

## Browser Window Setup

### General Browser Chrome

Recommended:

- Show the address bar.
- Show tabs when they help explain the "source tab to popup window" flow.
- Hide the bookmarks bar for Chrome and Edge screenshots.
- Use bookmark UI only in Firefox screenshots because bookmark context-menu support is Firefox-only.
- Hide unrelated extension icons.
- Use a clean browser profile with only Open in Basic Window installed/enabled.
- Use light mode unless your store listing intentionally targets dark mode.
- Set zoom to 100%.
- Use a simple theme/default browser appearance.

Avoid:

- Personal bookmarks, profile photos, account names, notification badges, or history suggestions.
- Crowded tab strips.
- Developer tooling, extension management pages, or browser-internal pages in marketing screenshots.
- URLs that imply affiliation with real third-party brands unless you own or have permission to show them.

### Tabs: Horizontal vs Vertical

Default recommendation:

- Use normal horizontal tabs for Chrome and Firefox.
- For Edge, avoid vertical tabs in the main first screenshots unless you specifically want to show Edge-native polish.

Why:

- Horizontal tabs are familiar across all three browsers.
- Vertical tabs consume left-side space and can distract from the context menu and popup window.
- Store screenshots should teach the extension behavior, not the browser's tab UI.

Exception:

- If you create an Edge-specific screenshot set, one later screenshot may use vertical tabs to show the extension fits Edge workflows. Keep it secondary, not the first gallery image.

## Page Content To Use

Use a deliberately simple local or controlled page with large clickable targets.

Good page sections:

- A large text link: `Example reference link`
- A large image tile
- A video/audio placeholder tile if practical
- A frame/embedded content placeholder if practical
- A plain page title and short paragraph

Recommended local URL options:

- A static local HTML file created for screenshots.
- A local dev server page.
- A simple page in the repo under screenshot fixtures.

Use neutral copy. Example:

- Page title: `Research Notes`
- Link text: `Open the reference article`
- URL shown in status/address area: `https://example.com/reference`

## Screenshot Storyboard

Use 4-6 screenshots. Put the strongest, clearest workflow first.

### 1. Context Menu On A Link

Purpose: immediately communicate the core action.

Setup:

- Browser window around `1280x800`.
- One clean page with a prominent link.
- Right-click the link.
- Place the context menu near the link, not covering the page title.
- Ensure "Open in Basic Window" is visible and highlighted if the browser supports hover highlighting.

Composition:

- Link on the left or center-left.
- Context menu to the right of the link.
- Keep enough empty page space that the menu is readable.

Browser chrome:

- Address bar visible.
- Bookmarks bar hidden.
- Extension toolbar icons minimized/hidden except the extension if you want it visible.

Caption idea:

> Open links from the context menu.

### 2. Popup Window Result

Purpose: show the payoff after selecting the menu item.

Setup:

- Source browser window in the background.
- Popup-style window in the foreground.
- Popup should be smaller than the main browser window and clearly separate.
- Both windows should show the same neutral target URL or title.

Composition:

- Main window slightly left/back.
- Popup window right/front.
- Leave room around both windows so the separate-window behavior is obvious.

Browser chrome:

- Show the popup's minimal window chrome.
- Avoid placing windows exactly on top of each other.
- If your OS window title bar appears, keep it clean and readable.

Caption idea:

> Open the selected target in a focused popup-style window.

### 3. Media Or Image Target

Purpose: show the extension is not link-only.

Setup:

- Page contains a large image or media placeholder.
- Right-click image/video/audio.
- Context menu shows "Open in Basic Window".

Composition:

- Large media card should be visually obvious.
- Context menu should overlap the media edge but not obscure the whole media item.

Caption idea:

> Works with images, video, audio, frames, pages, and tabs.

### 4. Tab Or Page Context

Purpose: show tab/page support.

Setup:

- Right-click on the page or tab strip where the browser exposes the extension item.
- Keep the browser UI uncluttered.

Composition:

- If using tab context, show 2-3 tabs maximum.
- If using page context, right-click an empty page area near meaningful content.

Caption idea:

> Open the current page or tab in a basic popup window.

### 5. Firefox Bookmark Support

Purpose: show Firefox-only bookmark behavior.

Setup:

- Firefox only.
- Open the bookmarks toolbar or bookmarks sidebar.
- Right-click a neutral bookmark.
- Context menu shows "Open in Basic Window".
- Do not stage bookmark screenshots in Chrome or Edge; those builds do not request the `bookmarks` permission or register the bookmark context.

Recommended layout:

- Prefer the Firefox bookmarks sidebar if it makes the selected bookmark and context menu easier to see.
- If using the bookmarks toolbar, keep only a few neutral bookmarks visible.

Browser chrome:

- It is OK to show the bookmarks sidebar for this screenshot because the feature is bookmark-specific.
- Avoid showing a real personal bookmarks tree.

Caption idea:

> Firefox: open supported bookmarks in a popup window.

### 6. Firefox Container Preservation

Purpose: show a meaningful Firefox differentiator without exposing private data.

Setup:

- Firefox only.
- Use a test container such as `Work`.
- Open a neutral page in that container.
- Use Open in Basic Window from a supported tab/page/link context.
- Capture the resulting popup window with the same container indicator visible.
- Do not stage container-preservation screenshots in Chrome or Edge; those builds do not request `cookies` or `contextualIdentities`.

Composition:

- Source container tab and popup window both visible if possible.
- The container name/color should be readable.

Caption idea:

> Firefox: preserve container identity when opening supported targets.

## Making Utility Screenshots More Attractive

Because the extension has a small UI surface, stage the screenshots like product demos:

- Use a clean, friendly demo page instead of a blank page.
- Use large clickable elements so the action is clear in thumbnails.
- Use one clear focal point per screenshot.
- Use consistent window sizes and spacing across all screenshots.
- Crop out excess desktop background.
- Prefer light, neutral backgrounds.
- Keep text short and readable.
- Use the same demo URL/title across screenshots for continuity.

If the store allows designed screenshots, you can combine literal captures with subtle framing:

- Add a clean background behind browser windows.
- Add short captions outside the browser UI.
- Add arrows or callouts sparingly.
- Do not fake browser UI if the store requires unmodified screenshots.

## Capture Workflow

1. Create or open a clean browser profile for the target browser.
2. Install the latest local build of Open in Basic Window.
3. Disable or hide unrelated extensions.
4. Set browser zoom to 100%.
5. Set the browser window to the capture size, preferably `1280x800`.
6. Open the neutral demo page.
7. Stage the context menu or popup window.
8. Capture the screenshot as PNG.
9. Crop/export to final dimensions if needed.
10. Save final PNGs in `assets/store/screenshots/real/` or another clearly named folder.
11. Keep any source files or raw captures in `assets/store/source/real/`.
12. Verify the screenshot at thumbnail size.

## Suggested File Names

Use explicit names so store uploads are easy to select:

- `real/01-chrome-context-menu-link-1280x800.png`
- `real/02-chrome-popup-result-1280x800.png`
- `real/03-chrome-media-target-1280x800.png`
- `real/04-edge-popup-result-1280x800.png`
- `real/05-firefox-bookmark-menu-1280x800.png`
- `real/06-firefox-container-popup-1280x800.png`

## Per-Browser Notes

### Chrome

- Use horizontal tabs.
- Hide bookmarks bar; Chrome does not support the extension's bookmark context.
- Avoid container-identity claims; Chrome does not support Firefox contextual identities.
- Keep the toolbar minimal.
- First screenshot should be context menu on a link or image.

### Microsoft Edge

- Use horizontal tabs for the main screenshots.
- Avoid vertical tabs unless creating an Edge-specific secondary screenshot.
- Hide bookmarks bar; Edge does not support the extension's bookmark context.
- Avoid container-identity claims; Edge does not support Firefox contextual identities.
- Hide sidebar features if they distract from the extension behavior.
- Keep shopping/sidebar/profile UI out of the capture.

### Firefox

- Use horizontal tabs for general screenshots.
- Use bookmarks sidebar or toolbar only for the bookmark-specific screenshot.
- Use a test container with a neutral name such as `Work` for container screenshots.
- Keep the Firefox container indicator visible when demonstrating contextual identity preservation.

## Quality Checklist

Before uploading:

- The "Open in Basic Window" menu item is readable.
- The selected target is obvious.
- The popup-style result is visibly separate from the source window.
- No personal data is visible.
- Browser UI is clean and not distracting.
- Screenshot text remains readable when viewed small.
- The screenshot matches actual extension behavior.
- Store-specific size and content requirements are satisfied.
- Browser-specific screenshots do not imply unsupported behavior in another browser.

## When To Use Generated Assets Instead

The generated assets in `assets/store/` are useful when:

- A store allows designed marketing images.
- Native context menus are hard to capture consistently.
- You need polished promotional images in exact dimensions.
- You want a privacy or feature-summary image that is clearer than raw browser UI.

Use real screenshots when:

- A store requires literal captures.
- You want to prove exact browser UI behavior.
- Review feedback asks for actual screenshots.
