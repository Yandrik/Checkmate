import { registerBackendClient } from "@/lib/proxyservice/backend";
import { registerFactCheckService,getFactCheckService } from "@/lib/proxyservice/factcheck";
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
        service.factcheck_section(tab?.title||"",info.pageUrl||"",info.selectionText, tab?.id||0).then(response=>{
          console.log("Fact check response: ", response);
        })}
    }
  });
});