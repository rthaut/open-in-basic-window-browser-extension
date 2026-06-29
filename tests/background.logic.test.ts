import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMenus,
  getCookieStoreId,
  getMenuApi,
  getMenuContexts,
  getMenuItemId,
  getMenuTarget,
  getTargetUrl,
  handleMenuClick,
  MENU_ID,
  type BrowserApi,
  type MenuApi,
} from "../src/background.logic";

function createMenuApi(overrides: Partial<MenuApi> = {}): MenuApi {
  return {
    create: vi.fn().mockResolvedValue(undefined),
    removeAll: vi.fn().mockResolvedValue(undefined),
    onClicked: {
      addListener: vi.fn(),
    },
    ...overrides,
  };
}

function createBrowserApi(overrides: Partial<BrowserApi> = {}): BrowserApi {
  const messages: Record<string, string> = {
    menuOpenInBasicWindow: "Open $TARGET$ in Basic Window",
    menuTargetLink: "Link",
    menuTargetImage: "Image",
    menuTargetVideo: "Video",
    menuTargetAudio: "Audio",
    menuTargetFrame: "Frame",
    menuTargetPage: "Page",
    menuTargetTab: "Tab",
    menuTargetBookmark: "Bookmark",
  };

  return {
    bookmarks: {
      get: vi.fn().mockResolvedValue([{ url: "https://bookmark.example/" }]),
    },
    contextMenus: createMenuApi(),
    i18n: {
      getMessage: vi.fn(
        (key: string, substitution?: string) =>
          messages[key]?.replace("$TARGET$", substitution ?? "") ?? "",
      ),
    },
    runtime: {
      onInstalled: { addListener: vi.fn() },
      onStartup: { addListener: vi.fn() },
    },
    tabs: {
      get: vi
        .fn()
        .mockResolvedValue({ id: 7, cookieStoreId: "firefox-container-1" }),
    },
    windows: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
    ...overrides,
  } as BrowserApi;
}

describe("background logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates Chromium-compatible context menus", async () => {
    const browserApi = createBrowserApi();

    await createMenus(browserApi, "chrome");

    expect(browserApi.contextMenus.removeAll).toHaveBeenCalledOnce();
    expect(browserApi.contextMenus.create).toHaveBeenCalledTimes(7);
    expect(browserApi.contextMenus.create).toHaveBeenNthCalledWith(1, {
      id: getMenuItemId("link"),
      title: "Open Link in Basic Window",
      contexts: ["link"],
    });
    expect(browserApi.contextMenus.create).toHaveBeenNthCalledWith(5, {
      id: getMenuItemId("frame"),
      title: "Open Frame in Basic Window",
      contexts: ["frame"],
    });
    expect(browserApi.contextMenus.create).toHaveBeenNthCalledWith(7, {
      id: getMenuItemId("tab"),
      title: "Open Tab in Basic Window",
      contexts: ["tab"],
    });
    expect(browserApi.i18n.getMessage).toHaveBeenCalledWith(
      "menuOpenInBasicWindow",
      "Link",
    );
  });

  it("adds bookmark context and prefers browser.menus for Firefox", async () => {
    const menus = createMenuApi();
    const browserApi = createBrowserApi({ menus });

    await createMenus(browserApi, "firefox");

    expect(menus.create).toHaveBeenCalledTimes(8);
    expect(menus.create).toHaveBeenLastCalledWith({
      id: getMenuItemId("bookmark"),
      title: "Open Bookmark in Basic Window",
      contexts: ["bookmark"],
    });
    expect(browserApi.contextMenus.create).not.toHaveBeenCalled();
  });

  it("skips tab menu creation for browsers that reject it", async () => {
    const create = vi.fn((properties) => {
      if (properties.contexts.includes("tab")) {
        return Promise.reject(new Error("unsupported context"));
      }

      return Promise.resolve(undefined);
    });
    const browserApi = createBrowserApi({
      contextMenus: createMenuApi({ create }),
    });

    await createMenus(browserApi, "chrome");

    expect(create).toHaveBeenCalledTimes(7);
    expect(create).toHaveBeenLastCalledWith({
      id: getMenuItemId("tab"),
      title: "Open Tab in Basic Window",
      contexts: ["tab"],
    });
  });

  it("selects the target URL using the selected menu target", async () => {
    const browserApi = createBrowserApi();

    await expect(
      getTargetUrl(browserApi, {
        menuItemId: getMenuItemId("link"),
        linkUrl: "https://link.example/",
        srcUrl: "https://image.example/",
      }),
    ).resolves.toBe("https://link.example/");
    await expect(
      getTargetUrl(browserApi, {
        menuItemId: getMenuItemId("image"),
        linkUrl: "https://link.example/",
        srcUrl: "https://image.example/",
      }),
    ).resolves.toBe("https://image.example/");
    await expect(
      getTargetUrl(browserApi, {
        menuItemId: getMenuItemId("frame"),
        frameUrl: "https://frame.example/",
      }),
    ).resolves.toBe("https://frame.example/");
    await expect(
      getTargetUrl(browserApi, {
        menuItemId: getMenuItemId("bookmark"),
        bookmarkId: "abc123",
      }),
    ).resolves.toBe("https://bookmark.example/");
    await expect(
      getTargetUrl(
        browserApi,
        { menuItemId: getMenuItemId("tab"), pageUrl: "https://page.example/" },
        { url: "https://tab.example/" },
      ),
    ).resolves.toBe("https://tab.example/");
    await expect(
      getTargetUrl(browserApi, {
        menuItemId: getMenuItemId("page"),
        pageUrl: "https://page.example/",
      }),
    ).resolves.toBe("https://page.example/");
  });

  it("opens supported URLs in focused popup windows", async () => {
    const browserApi = createBrowserApi();

    await handleMenuClick(
      browserApi,
      {
        menuItemId: getMenuItemId("link"),
        linkUrl: "https://target.example/",
      },
      { id: 7, url: "https://tab.example/" },
    );

    expect(browserApi.windows.create).toHaveBeenCalledWith({
      url: "https://target.example/",
      type: "popup",
      focused: true,
      cookieStoreId: "firefox-container-1",
    });
  });

  it("does not open unsupported URLs or other menu items", async () => {
    const browserApi = createBrowserApi();

    await handleMenuClick(browserApi, {
      menuItemId: getMenuItemId("link"),
      linkUrl: "chrome://extensions",
    });
    await handleMenuClick(browserApi, {
      menuItemId: "another-menu",
      linkUrl: "https://target.example/",
    });

    expect(browserApi.windows.create).not.toHaveBeenCalled();
  });

  it("does not copy contextual identity for bookmark launches", async () => {
    const browserApi = createBrowserApi();

    await handleMenuClick(browserApi, {
      menuItemId: getMenuItemId("bookmark"),
      bookmarkId: "abc123",
    });

    expect(browserApi.tabs.get).not.toHaveBeenCalled();
    expect(browserApi.windows.create).toHaveBeenCalledWith({
      url: "https://bookmark.example/",
      type: "popup",
      focused: true,
    });
  });

  it("ignores tab lookup failures when copying cookie store IDs", async () => {
    const browserApi = createBrowserApi({
      tabs: { get: vi.fn().mockRejectedValue(new Error("tab closed")) },
    });

    await expect(
      getCookieStoreId(browserApi, { menuItemId: MENU_ID }, { id: 7 }),
    ).resolves.toBeUndefined();
  });

  it("exposes stable menu context helpers", () => {
    expect(getMenuContexts("edge")).toEqual([
      "link",
      "image",
      "video",
      "audio",
      "frame",
      "page",
      "tab",
    ]);
    expect(getMenuContexts("firefox")).toContain("bookmark");

    const menus = createMenuApi();
    const browserApi = createBrowserApi({ menus });
    expect(getMenuApi(browserApi)).toBe(menus);
    expect(getMenuItemId("link")).toBe(`${MENU_ID}:link`);
    expect(getMenuTarget(`${MENU_ID}:link`)).toBe("link");
    expect(getMenuTarget(`${MENU_ID}:unknown`)).toBeUndefined();
  });
});
