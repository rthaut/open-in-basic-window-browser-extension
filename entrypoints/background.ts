import { browser, type Browser } from "wxt/browser";

const MENU_ID = "open-in-basic-window";
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

type MenuContext =
  | `${Browser.contextMenus.ContextType}`
  | (typeof TAB_CONTEXTS)[number]
  | (typeof FIREFOX_ONLY_CONTEXTS)[number];
type MenuClickData = Browser.contextMenus.OnClickData & {
  bookmarkId?: string;
};
type MenuApi = {
  create: (properties: {
    id: string;
    title: string;
    contexts: MenuContext[];
  }) => number | string;
  removeAll: () => Promise<void>;
  onClicked: {
    addListener: (
      callback: (info: MenuClickData, tab?: Browser.tabs.Tab) => void,
    ) => void;
  };
};

type TabWithCookieStoreId = Browser.tabs.Tab & {
  cookieStoreId?: string;
};
type WindowCreateDataWithCookieStoreId = Browser.windows.CreateData & {
  cookieStoreId?: string;
};

export default defineBackground(() => {
  const menuApi = getMenuApi();

  browser.runtime.onInstalled.addListener(createMenus);
  browser.runtime.onStartup.addListener(createMenus);
  menuApi.onClicked.addListener(handleMenuClick);
});

async function createMenus() {
  const menuApi = getMenuApi();
  await menuApi.removeAll();

  menuApi.create({
    id: MENU_ID,
    title: browser.i18n.getMessage("menuOpenInBasicWindow"),
    contexts: getMenuContexts(),
  });
}

async function handleMenuClick(
  info: MenuClickData,
  tab?: Browser.tabs.Tab,
) {
  if (info.menuItemId !== MENU_ID) return;

  const url = await getTargetUrl(info, tab);
  if (!isOpenableUrl(url)) return;

  const createData: WindowCreateDataWithCookieStoreId = {
    url,
    type: "popup",
    focused: true,
  };

  const cookieStoreId = await getCookieStoreId(info, tab);
  if (cookieStoreId) {
    createData.cookieStoreId = cookieStoreId;
  }

  await browser.windows.create(createData);
}

async function getTargetUrl(
  info: MenuClickData,
  tab?: Browser.tabs.Tab,
): Promise<string | undefined> {
  if (info.linkUrl) return info.linkUrl;
  if (info.srcUrl) return info.srcUrl;
  if (info.frameUrl) return info.frameUrl;

  if (info.bookmarkId) {
    const [bookmark] = await browser.bookmarks.get(info.bookmarkId);
    return bookmark.url;
  }

  return tab?.url ?? info.pageUrl;
}

async function getCookieStoreId(
  info: MenuClickData,
  tab?: Browser.tabs.Tab,
): Promise<string | undefined> {
  if (!tab?.id || info.bookmarkId) return undefined;

  try {
    const sourceTab = (await browser.tabs.get(tab.id)) as TabWithCookieStoreId;
    return sourceTab.cookieStoreId;
  } catch {
    return undefined;
  }
}

function getMenuApi(): MenuApi {
  const browserWithFirefoxMenus = browser as typeof browser & {
    menus?: MenuApi;
  };

  return (browserWithFirefoxMenus.menus ?? browser.contextMenus) as MenuApi;
}

function getMenuContexts(): MenuContext[] {
  if (import.meta.env.BROWSER === "firefox") {
    return [...PAGE_CONTEXTS, ...TAB_CONTEXTS, ...FIREFOX_ONLY_CONTEXTS];
  }

  return [...PAGE_CONTEXTS, ...TAB_CONTEXTS];
}

function isOpenableUrl(url: string | undefined): url is string {
  return typeof url === "string" && /^https?:\/\//i.test(url);
}
