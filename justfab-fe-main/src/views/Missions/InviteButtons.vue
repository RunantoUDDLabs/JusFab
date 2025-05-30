<script setup>
import { shareURL } from "@telegram-apps/sdk";

const gameStore = useGameStore();
const userStore = useUserStore();

const fontSizeBase = computed(() => gameStore.baseFontSize);
const inviteLink = computed(() => userStore.userRefLink);

onMounted(async () => {
  await getReferralLink();
});

const submitCopyInvite = ($event) => {
  handleNormalClickAnimation($event);
  copyToClipboard(inviteLink.value);
};

const submitShareInvite = async ($event) => {
  handleNormalClickAnimation($event);

  if (shareURL.isAvailable()) {
    shareURL(
      inviteLink.value,
      "Yo, welcome to the world of Fabs! We’re about to go on some crazy ride, where we’ll probably try to save this whole damn thing. Or not, we’ll see what happens.You’re a key part of this madness. Join the Fabs crew, help out your empire and contribute to some good times, which we are all trying to bring back. There’s food, laughs, and all that, or at least there will be when we fix things up.Hit that “Play Now” button and let’s get this show on the road!"
    );
  } else {
    if (navigator.share) {
      // If Web Share API is available, open the native share dialog
      try {
        await navigator.share({
          title: "JUSTFAB",
          text: "Yo, welcome to the world of Fabs! We’re about to go on some crazy ride, where we’ll probably try to save this whole damn thing. Or not, we’ll see what happens.You’re a key part of this madness. Join the Fabs crew, help out your empire and contribute to some good times, which we are all trying to bring back. There’s food, laughs, and all that, or at least there will be when we fix things up.Hit that “Play Now” button and let’s get this show on the road!",
          url: inviteLink.value,
        });
      } catch (error) {
        console.error("Error while sharing:", error);
      }
    } else {
      // If Web Share API is not available, show fallback options
      console.warn("Web Share API is not supported in this browser.");
    }
  }
};
</script>

<template>
  <div class="tw-grid tw-grid-cols-2 tw-gap-[4%]">
    <v-btn
      class="btn-invite"
      :style="{
        fontSize: `${fontSizeBase * 1.8}px !important`,
      }"
      color="#FAE1AE"
      flat
      @click.stop="submitCopyInvite"
    >
      Copy
    </v-btn>

    <v-btn
      class="btn-invite"
      :style="{
        fontSize: `${fontSizeBase * 1.8}px !important`,
      }"
      color="#FAE1AE"
      flat
      @click.stop="submitShareInvite"
    >
      Share
    </v-btn>
  </div>
</template>

<style lang="postcss" scoped>
.btn-invite {
  @apply tw-aspect-[301/100] tw-w-full !tw-h-auto tw-bg-cover tw-bg-center tw-bg-no-repeat tw-rounded-lg tw-overflow-hidden  !tw-text-[#AE613A];
  box-shadow: 0px 12.28px 13.16px -1.75px rgba(0, 0, 0, 0.21);
  border: 0.1em solid #fcf0c6;
}
</style>
