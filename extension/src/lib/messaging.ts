import { defineExtensionMessaging } from "@webext-core/messaging";
import { FactCheckDetailsRequest } from "@/lib/api/models/FactCheckDetailsRequest"

interface ProtocolMap {
  // getStringLength(data: string): number;
  getPageContent(): FactCheckDetailsRequest | null,
  // Get the currently active tab's ID, or -1 if not available
  getCurrentTabId(): number,
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
