import { init } from "@telegram-apps/sdk";
// import { init } from "@telegram-apps/sdk-vue";

import { isTMA } from "@telegram-apps/bridge";

export default function () {
  try {
    if (isTMA()) {
      console.log("It's Telegram Mini Apps");
      init();
    }
  } catch (error) {
    console.error(error);
  }
}
