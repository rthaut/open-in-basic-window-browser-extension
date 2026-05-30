import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMenus,
  getCookieStoreId,
  getMenuApi,
  getMenuContexts,
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
  return {
    bookmarks: {
      get: vi.fn().mockResolvedValue([{ url: "https://bookmark.example/" }]),
    },
    contextMenus: createMenuApi(),
    i18n: {
      getMessage: vi.fn().mockReturnValue("Open in Basic Window"),
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
    expect(browserApi.contextMenus.create).toHaveBeenCalledWith({
      id: MENU_ID,
      title: "Open in Basic Window",
      contexts: ["link", "image", "video", "audio", "frame", "page", "tab"],
    });
  });

  it("adds bookmark context and prefers browser.menus for Firefox", async () => {
    const menus = createMenuApi();
    const browserApi = createBrowserApi({ menus });

    await createMenus(browserApi, "firefox");

    expect(menus.create).toHaveBeenCalledWith({
      id: MENU_ID,
      title: "Open in Basic Window",
      contexts: [
        "link",
        "image",
        "video",
        "audio",
        "frame",
        "page",
        "tab",
        "bookmark",
      ],
    });
    expect(browserApi.contextMenus.create).not.toHaveBeenCalled();
  });

  it("retries menu creation without tab context for browsers that reject it", async () => {
    const create = vi
      .fn()
      .mockRejectedValueOnce(new Error("unsupported context"))
      .mockResolvedValueOnce(undefined);
    const browserApi = createBrowserApi({
      contextMenus: createMenuApi({ create }),
    });

    await createMenus(browserApi, "chrome");

    expect(create).toHaveBeenCalledTimes(2);
    expect(create).toHaveBeenLastCalledWith({
      id: MENU_ID,
      title: "Open in Basic Window",
      contexts: ["link", "image", "video", "audio", "frame", "page"],
    });
  });

  it("selects the target URL using the extension priority order", async () => {
    const browserApi = createBrowserApi();

    await expect(
      getTargetUrl(browserApi, {
        menuItemId: MENU_ID,
        linkUrl: "https://link.example/",
        srcUrl: "https://image.example/",
      }),
    ).resolves.toBe("https://link.example/");
    await expect(
      getTargetUrl(browserApi, {
        menuItemId: MENU_ID,
        srcUrl: "https://image.example/",
      }),
    ).resolves.toBe("https://image.example/");
    await expect(
      getTargetUrl(browserApi, {
        menuItemId: MENU_ID,
        frameUrl: "https://frame.example/",
      }),
    ).resolves.toBe("https://frame.example/");
    await expect(
      getTargetUrl(browserApi, { menuItemId: MENU_ID, bookmarkId: "abc123" }),
    ).resolves.toBe("https://bookmark.example/");
    await expect(
      getTargetUrl(
        browserApi,
        { menuItemId: MENU_ID, pageUrl: "https://page.example/" },
        { url: "https://tab.example/" },
      ),
    ).resolves.toBe("https://tab.example/");
  });

  it("opens supported URLs in focused popup windows", async () => {
    const browserApi = createBrowserApi();

    await handleMenuClick(
      browserApi,
      { menuItemId: MENU_ID, linkUrl: "https://target.example/" },
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
      menuItemId: MENU_ID,
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
      menuItemId: MENU_ID,
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
  });
});
