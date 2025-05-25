import { onMessage } from "@/lib/messaging";
import { registerBackendClient } from "@/lib/proxyservice/backend";
import { registerFactCheckService, getFactCheckService } from "@/lib/proxyservice/factcheck";
import { registerFactCheckDbService } from "@/lib/proxyservice/factcheck_db";

export default defineBackground(() => {
  const contextMenuNameId = "checkmate-context-menu-select-text";
  registerBackendClient();
  registerFactCheckDbService();
  registerFactCheckService();

  browser.contextMenus.create({
    id: contextMenuNameId,
    title: "Checkmate: fact check selected text",
    contexts: ["selection"],
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === contextMenuNameId) {
      if (info.selectionText) {
        const service = getFactCheckService();
        service.factcheck_section(tab?.title || "", info.pageUrl || "", info.selectionText, tab?.id || 0).then(response => {
          console.log("Fact check response: ", response);
        })
      }
    }
  });

  onMessage("getCurrentTabId", async () => {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    return currentTab?.id ?? -1;
  });

  console.log("Background script loaded");
});