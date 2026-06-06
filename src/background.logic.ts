import type { Browser } from "wxt/browser";

export const MENU_ID = "open-in-basic-window";

const PAGE_CONTEXTS = [
  "link",
  "image",
  "video",
  "audio",
  "frame",
  "page",
] as const;
const TAB_CONTEXTS = ["tab"] as const;
const FIREFOX_ONLY_CONTEXTS = ["bookmark"] as const;
const MENU_TARGET_MESSAGE_KEYS = {
  link: "menuTargetLink",
  image: "menuTargetImage",
  video: "menuTargetVideo",
  audio: "menuTargetAudio",
  frame: "menuTargetFrame",
  page: "menuTargetPage",
  tab: "menuTargetTab",
  bookmark: "menuTargetBookmark",
} as const satisfies Record<MenuContext, string>;

export type BrowserTarget = "chrome" | "edge" | "firefox" | string;
export type MenuContext =
  | (typeof PAGE_CONTEXTS)[number]
  | (typeof TAB_CONTEXTS)[number]
  | (typeof FIREFOX_ONLY_CONTEXTS)[number];
export type MenuClickData = Omit<
  Partial<Browser.contextMenus.OnClickData>,
  "menuItemId"
> & {
  menuItemId: Browser.contextMenus.OnClickData["menuItemId"];
  bookmarkId?: string;
};
type SourceTab = Pick<Browser.tabs.Tab, "id" | "url">;
export type MenuApi = {
  create: (properties: {
    id: string;
    title: string;
    contexts: MenuContext[];
  }) => number | string | Promise<unknown>;
  removeAll: () => Promise<void>;
  onClicked: {
    addListener: (
      callback: (info: MenuClickData, tab?: SourceTab) => void,
    ) => void;
  };
};

type RuntimeApi = Pick<typeof Browser.runtime, "onInstalled" | "onStartup">;
type TabsApi = Pick<typeof Browser.tabs, "get">;
type WindowsApi = Pick<typeof Browser.windows, "create">;
type BookmarksApi = Pick<typeof Browser.bookmarks, "get">;
type I18nApi = Pick<typeof Browser.i18n, "getMessage">;

type TabWithCookieStoreId = Browser.tabs.Tab & {
  cookieStoreId?: string;
};
type WindowCreateDataWithCookieStoreId = Browser.windows.CreateData & {
  cookieStoreId?: string;
};

export type BrowserApi = {
  bookmarks: BookmarksApi;
  contextMenus: MenuApi;
  i18n: I18nApi;
  menus?: MenuApi;
  runtime: RuntimeApi;
  tabs: TabsApi;
  windows: WindowsApi;
};

export function registerBackgroundListeners(
  browserApi: BrowserApi,
  browserTarget: BrowserTarget,
) {
  const menuApi = getMenuApi(browserApi);
  const createTargetMenus = () => createMenus(browserApi, browserTarget);

  browserApi.runtime.onInstalled.addListener(createTargetMenus);
  browserApi.runtime.onStartup.addListener(createTargetMenus);
  menuApi.onClicked.addListener((info, tab) =>
    handleMenuClick(browserApi, info, tab),
  );
}

export async function createMenus(
  browserApi: BrowserApi,
  browserTarget: BrowserTarget,
) {
  const menuApi = getMenuApi(browserApi);
  await menuApi.removeAll();

  const contexts = getMenuContexts(browserTarget);

  for (const context of contexts) {
    try {
      await createMenuItem(browserApi, menuApi, context);
    } catch (error) {
      if (context !== "tab") throw error;
    }
  }
}

export async function handleMenuClick(
  browserApi: BrowserApi,
  info: MenuClickData,
  tab?: SourceTab,
) {
  const menuTarget = getMenuTarget(info.menuItemId);
  if (!menuTarget) return;

  const url = await getTargetUrl(browserApi, info, tab, menuTarget);
  if (!isOpenableUrl(url)) return;

  const createData: WindowCreateDataWithCookieStoreId = {
    url,
    type: "popup",
    focused: true,
  };

  const cookieStoreId = await getCookieStoreId(browserApi, info, tab);
  if (cookieStoreId) {
    createData.cookieStoreId = cookieStoreId;
  }

  await browserApi.windows.create(createData);
}

export async function getTargetUrl(
  browserApi: BrowserApi,
  info: MenuClickData,
  tab?: SourceTab,
  menuTarget = getMenuTarget(info.menuItemId),
): Promise<string | undefined> {
  switch (menuTarget) {
    case "link":
      return info.linkUrl;
    case "image":
    case "video":
    case "audio":
      return info.srcUrl;
    case "frame":
      return info.frameUrl;
    case "bookmark": {
      if (!info.bookmarkId) return undefined;
      const [bookmark] = await browserApi.bookmarks.get(info.bookmarkId);
      return bookmark.url;
    }
    case "page":
      return info.pageUrl;
    case "tab":
      return tab?.url;
    default:
      return info.linkUrl ?? info.srcUrl ?? info.frameUrl ?? tab?.url ?? info.pageUrl;
  }
}

export async function getCookieStoreId(
  browserApi: BrowserApi,
  info: MenuClickData,
  tab?: SourceTab,
): Promise<string | undefined> {
  if (!tab?.id || info.bookmarkId) return undefined;

  try {
    const sourceTab = (await browserApi.tabs.get(tab.id)) as TabWithCookieStoreId;
    return sourceTab.cookieStoreId;
  } catch {
    return undefined;
  }
}

export function getMenuApi(browserApi: BrowserApi): MenuApi {
  return (browserApi.menus ?? browserApi.contextMenus) as MenuApi;
}

export function getMenuContexts(browserTarget: BrowserTarget): MenuContext[] {
  if (browserTarget === "firefox") {
    return [...PAGE_CONTEXTS, ...TAB_CONTEXTS, ...FIREFOX_ONLY_CONTEXTS];
  }

  return [...PAGE_CONTEXTS, ...TAB_CONTEXTS];
}

function createMenuItem(
  browserApi: BrowserApi,
  menuApi: MenuApi,
  context: MenuContext,
) {
  return menuApi.create({
    id: getMenuItemId(context),
    title: getMenuTitle(browserApi, context),
    contexts: [context],
  });
}

export function getMenuItemId(context: MenuContext): string {
  return `${MENU_ID}:${context}`;
}

export function getMenuTarget(menuItemId: unknown): MenuContext | undefined {
  if (menuItemId === MENU_ID) return undefined;
  if (typeof menuItemId !== "string") return undefined;

  const context = menuItemId.slice(`${MENU_ID}:`.length);
  if (menuItemId !== getMenuItemId(context as MenuContext)) return undefined;
  if (!isMenuContext(context)) return undefined;

  return context;
}

function getMenuTitle(browserApi: BrowserApi, context: MenuContext): string {
  const targetName = browserApi.i18n.getMessage(
    MENU_TARGET_MESSAGE_KEYS[context],
  );
  return browserApi.i18n.getMessage("menuOpenInBasicWindow", targetName);
}

function isMenuContext(context: string): context is MenuContext {
  return context in MENU_TARGET_MESSAGE_KEYS;
}

function isOpenableUrl(url: string | undefined): url is string {
  return typeof url === "string" && /^https?:\/\//i.test(url);
}
