import { browser } from "wxt/browser";
import {
  registerBackgroundListeners,
  type BrowserApi,
} from "../src/background.logic";

export default defineBackground(() => {
  registerBackgroundListeners(
    browser as unknown as BrowserApi,
    import.meta.env.BROWSER,
  );
});
