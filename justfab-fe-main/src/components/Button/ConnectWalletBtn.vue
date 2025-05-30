<script setup>
import btnConnectWallet from "@images/game/btn-connect-wallet.png";
import { getLoginURL } from "@/utils/FPClient";

const walletAddress = ref(null);

const connectWallet = async ($event) => {
  handleNormalClickAnimation($event);

  const url = await getLoginURL();
  console.log(url);
  window.location.href = url;
};

const disconnectWallet = async () => {};
</script>

<template>
  <v-btn
    @click="connectWallet"
    color="transparent"
    flat
    class="tw-mx-auto tw-bg-cover tw-bg-center tw-bg-no-repeat tw-aspect-[387/104] tw-w-[53%] !tw-h-auto !tw-rounded-[12%] tw-overflow-hidden jump-in-anim"
    :style="{ backgroundImage: `url(${btnConnectWallet})` }"
  >
  </v-btn>
</template>
