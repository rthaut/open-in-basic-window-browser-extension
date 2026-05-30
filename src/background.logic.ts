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

export type BrowserTarget = "chrome" | "edge" | "firefox" | string;
export type MenuContext =
  | `${Browser.contextMenus.ContextType}`
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

  try {
    await createMenuItem(browserApi, menuApi, contexts);
  } catch (error) {
    if (!contexts.includes("tab")) throw error;

    await createMenuItem(
      browserApi,
      menuApi,
      contexts.filter((context) => context !== "tab"),
    );
  }
}

export async function handleMenuClick(
  browserApi: BrowserApi,
  info: MenuClickData,
  tab?: SourceTab,
) {
  if (info.menuItemId !== MENU_ID) return;

  const url = await getTargetUrl(browserApi, info, tab);
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
): Promise<string | undefined> {
  if (info.linkUrl) return info.linkUrl;
  if (info.srcUrl) return info.srcUrl;
  if (info.frameUrl) return info.frameUrl;

  if (info.bookmarkId) {
    const [bookmark] = await browserApi.bookmarks.get(info.bookmarkId);
    return bookmark.url;
  }

  return tab?.url ?? info.pageUrl;
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
  contexts: MenuContext[],
) {
  return menuApi.create({
    id: MENU_ID,
    title: browserApi.i18n.getMessage("menuOpenInBasicWindow"),
    contexts,
  });
}

function isOpenableUrl(url: string | undefined): url is string {
  return typeof url === "string" && /^https?:\/\//i.test(url);
}
