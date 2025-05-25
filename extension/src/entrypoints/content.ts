import '../app.css';
import Content from "@/entrypoints/content/Content.svelte";
import FullPageFactCheckButton from '@/lib/components/FullPageFactCheckButton.svelte';
import { sendMessage } from '@/lib/messaging';
import { mount } from "svelte";

export default defineContentScript({
  allFrames: true,
  matches: ['*://*/*'],
  async main() {
    // const appVersion = browser?.runtime?.getManifest()?.version || "0.0.0-dev"
    console.log('Hello content.');

    mount(Content, {
      target: document.body
    })

    console.log('Mounting FullPageFactCheckButton');

    mount(FullPageFactCheckButton, {
      target: document.body,
      props: {
      }
    })
  }

});
