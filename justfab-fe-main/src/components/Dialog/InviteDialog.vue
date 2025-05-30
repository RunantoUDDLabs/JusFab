<script setup>
import bgPopupInvite from "@images/game/popup-invite.png";
import btnCopyInvte from "@images/game/btn-copy-invite.png";
import btnShareInvite from "@images/game/btn-share-invite.png";
import iconClose from "@images/game/icon-close.png";
import { shareURL } from "@telegram-apps/sdk";

const props = defineProps({
  width: {
    type: Number,
    default: 0,
  },
});

const userStore = useUserStore();

const inviteDialog = ref(false);
const inviteLink = computed(() => userStore.userRefLink);

const emit = defineEmits(["onConfirm", "onCancel"]);

onMounted(async () => {
  await getReferralLink();
});

const openDialog = () => {
  inviteDialog.value = true;
};

const closeDialog = () => {
  emit("onCancel");
  inviteDialog.value = false;
};

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

defineExpose({ openDialog, inviteDialog, closeDialog });
</script>

<template>
  <v-dialog
    v-model="inviteDialog"
    class=""
    content-class="popup-invite"
    max-width="766"
    :width="width"
    persistent
  >
    <IconBtn
      flat
      icon
      color="transparent"
      variant="elevated"
      class="tw-absolute tw-top-[7%] tw-right-[7%] tw-z-[1]"
      @click="closeDialog"
    >
      <v-img :src="iconClose" width="44" max-width="50%" />
    </IconBtn>

    <v-card
      class="!tw-rounded-2xl tw-px-4 tw-py-2 !tw-shadow-none !tw-bg-cover tw-bg-center tw-bg-no-repeat tw-aspect-[766/566]"
      :style="{ backgroundImage: `url(${bgPopupInvite})` }"
      color="transparent"
      flat
    >
      <v-card-text class="tw-text-center !tw-px-[5%] !tw-pt-[23%]">
        <div
          class="tw-py-[5%] tw-flex tw-flex-wrap tw-w-full tw-h-full tw-justify-center tw-items-center"
        >
          <v-btn
            class="tw-aspect-[580/114] tw-w-[83%] !tw-h-auto tw-bg-cover tw-bg-center tw-bg-no-repeat tw-rounded-lg tw-overflow-hidden"
            color="transparent"
            flat
            :style="{ backgroundImage: `url(${btnCopyInvte})` }"
            @click.stop="submitCopyInvite"
          />

          <v-btn
            class="tw-aspect-[580/114] tw-w-[83%] !tw-h-auto tw-bg-cover tw-bg-center tw-bg-no-repeat tw-rounded-lg tw-overflow-hidden"
            color="transparent"
            flat
            :style="{ backgroundImage: `url(${btnShareInvite})` }"
            @click.stop="submitShareInvite"
          />
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style lang="postcss" scoped></style>
