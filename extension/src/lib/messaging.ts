import { defineExtensionMessaging } from "@webext-core/messaging";
import { Result } from "neverthrow";

export interface PageContent {
    title: string;
    url: string;
    text: string;
    html?: string;
}

interface ProtocolMap {
  // getStringLength(data: string): number;
  getPageContent(): PageContent,
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
