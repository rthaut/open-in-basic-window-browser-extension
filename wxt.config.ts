import { defineConfig } from "wxt";
import { generateIcons } from "./scripts/generate-icons.mjs";

export default defineConfig({
  manifestVersion: 3,
  hooks: {
    "build:before": () => generateIcons(),
  },
  manifest: ({ browser }) => ({
    name: "__MSG_extensionName__",
    description: "__MSG_extensionDescription__",
    default_locale: "en_US",
    permissions: [
      browser === "firefox" ? "menus" : "contextMenus",
      "tabs",
      "bookmarks",
      ...(browser === "firefox" ? ["cookies", "contextualIdentities"] : []),
    ],
    ...(browser === "firefox"
      ? {
          browser_specific_settings: {
            gecko: {
              data_collection_permissions: {
                required: ["none"],
              },
            },
          },
        }
      : {}),
  }),
});
