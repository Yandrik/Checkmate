import { defineExtensionMessaging } from "@webext-core/messaging";
import { FactCheckDetailsRequest }  from "@/lib/api/models/FactCheckDetailsRequest"

interface ProtocolMap {
  // getStringLength(data: string): number;
  getPageContent(): FactCheckDetailsRequest,
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
