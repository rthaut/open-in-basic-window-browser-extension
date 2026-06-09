# Permission Justifications

Store-review-ready permission explanations for Open in Basic Window.

## Browser Support Note

Bookmark context-menu support is Firefox-only for this extension.

- Chrome [`contextMenus.ContextType`](https://developer.chrome.com/docs/extensions/reference/api/contextMenus#type-ContextType) includes contexts such as `page`, `frame`, `selection`, `link`, `editable`, `image`, `video`, `audio`, `action`, and `tab`, but not `bookmark`.
- Microsoft Edge documents [`contextMenus`](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/developer-guide/api-support) as the Chromium-style API for right-click menu items and does not expose a bookmark context for this extension.
- Firefox [`menus.ContextType`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/menus/ContextType) includes `bookmark`, and MDN documents that the `bookmark` context requires the `bookmarks` API permission.

Because of that support split, Chrome and Edge builds request only `contextMenus` and `tabs`, while Firefox builds additionally request `bookmarks`, `cookies`, and `contextualIdentities`.

## `contextMenus` / `menus`

Required to add the target-specific "Open [Target] in Basic Window" items to browser context menus. Firefox exposes this API as `menus`; Chrome and Edge expose it as `contextMenus`.

## `tabs`

Required to read the source tab URL when the selected context is a page or tab and to preserve source-tab context when opening a popup window.

The extension does not collect or store tab history. It only uses the active context-menu event and source tab information needed for the selected action.

## Firefox `bookmarks`

Required for Firefox bookmark context-menu support so the extension can resolve the selected bookmark ID to the bookmark URL before opening it.

The extension does not scan, collect, store, or transmit bookmark data.

## Firefox `cookies`

Required only because Firefox associates container identity with cookie stores. The extension uses the source tab's `cookieStoreId` to open the new popup window in the same Firefox container when possible.

The extension does not read, store, modify, or transmit cookie values.

## Firefox `contextualIdentities`

Required to support Firefox containers/contextual identities when opening a supported target from a container tab.

The extension uses this capability only to preserve the user's existing container context for the newly opened window.

## Data Collection

The extension does not collect, store, transmit, sell, share, or analyze user data. All behavior runs locally in the browser.
