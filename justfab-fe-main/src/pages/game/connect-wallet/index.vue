<script setup>
import bgConnectWallet from "@images/game/bg-connect-wallet.png";
import inputConnectWallet from "@images/game/input-connect-wallet.png";

definePage({
  meta: {
    layout: "game",
    requiresAuth: true,
    subject: "User",
    action: "read",
  },
});

const gameStore = useGameStore();

const walletAddress = ref("");
const email = ref("");
const chainId = ref("");

const fontSizeBase = computed(() => gameStore.baseFontSize);

onMounted(() => {
  walletAddress.value = localStorage.getItem("fp_futurepass");
  email.value = localStorage.getItem("fb_email")
    ? localStorage.getItem("fb_email")
    : "none";
  chainId.value = localStorage.getItem("fp_chainId");
});
</script>

<template>
  <div
    class="game-content tw-flex-auto tw-flex tw-items-center tw-justify-center"
  >
    <v-card
      class="!tw-bg-cover tw-bg-center tw-bg-no-repeat tw-aspect-[892/829]"
      width="82%"
      max-width="90%"
      flat
      color="transparent"
      :style="{ backgroundImage: `url(${bgConnectWallet})` }"
    >
      <v-card-text class="!tw-p-[5%] tw-h-full">
        <div class="tw-grid tw-h-full tw-pt-[13%] tw-py-[5%] tw-px-[7%]">
          <v-text-field
            v-model="walletAddress"
            class="input-connect-wallet"
            variant="solo-filled"
            readonly
            bg-color="transparent"
            flat
            hide-details
            :style="{ backgroundImage: `url(${inputConnectWallet})` }"
          />

          <v-text-field
            v-model="chainId"
            class="input-connect-wallet"
            variant="solo-filled"
            readonly
            bg-color="transparent"
            flat
            hide-details
            :style="{ backgroundImage: `url(${inputConnectWallet})` }"
          />

          <v-text-field
            v-model="email"
            class="input-connect-wallet"
            variant="solo-filled"
            readonly
            bg-color="transparent"
            flat
            hide-details
            :style="{
              backgroundImage: `url(${inputConnectWallet})`,
              fontSize: `${fontSizeBase}px`,
            }"
          />

          <connect-wallet-btn />
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<style lang="postcss">
.input-connect-wallet {
  @apply tw-aspect-[688/140]
    tw-bg-cover
    tw-bg-center
    tw-bg-no-repeat
    !tw-rounded-[8%]
    tw-overflow-hidden;
  input {
    @apply tw-aspect-[688/130];
    font-size: var(--base-font-size);
  }
}
</style>
