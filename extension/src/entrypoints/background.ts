import { registerBackendClient } from "@/lib/proxyservice/backend";
import { registerFactCheckService } from "@/lib/proxyservice/factcheck";
import { registerFactCheckDbService } from "@/lib/proxyservice/factcheck_db";


export default defineBackground(() => {

  registerBackendClient();
  registerFactCheckDbService();
  registerFactCheckService();

  browser.contextMenus.create({
    id: "log-selected-text",
    title: "Log Selected Text",
    contexts: ["selection"],
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "log-selected-text") {
      if (info.selectionText) {
        console.log("Selected text:", info.selectionText);
      }
    }
  });


  console.log("Background script loaded");
});