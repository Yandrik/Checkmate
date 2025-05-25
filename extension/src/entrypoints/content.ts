import '../app.css';
import FullPageFactCheckButton from '@/lib/components/FullPageFactCheckButton.svelte';
import { sendMessage } from '@/lib/messaging';
import { mount } from "svelte";

export default defineContentScript({
  allFrames: true,
  matches: ['*://*/*'],
  async main() {
    // const appVersion = browser?.runtime?.getManifest()?.version || "0.0.0-dev"
    console.log('Hello content.');

    console.log('Mounting FullPageFactCheckButton');

    mount(FullPageFactCheckButton, {
      target: document.body,
      props: {
      }
    })
  }

});
