<script setup>
import bgPopup from "@images/game/bg-popup.svg";
import energy from "@images/game/energy.svg";
import btnClaim from "@images/game/btn-claim.svg";

const props = defineProps({
  width: {
    type: Number,
    default: 0,
  },
});

const resultDialog = ref(false);

const emit = defineEmits(["onConfirm", "onCancel"]);

const openDialog = () => {
  resultDialog.value = true;
};

const closeDialog = () => {
  emit("onCancel");
  resultDialog.value = false;
};

const submitDialog = () => {
  emit("onConfirm");
  resultDialog.value = false;
};

const submitCopyInvite = () => {
  console.log("submitCopyInvite");
};

const submitShareInvite = () => {
  console.log("submitShareInvite");
};

defineExpose({ openDialog, resultDialog, closeDialog });
</script>

<template>
  <v-dialog
    v-model="resultDialog"
    class=""
    content-class="popup-invite"
    max-width="731"
    :width="width"
    persistent
  >
    <v-card
      class="!tw-rounded-2xl tw-px-4 tw-py-2 !tw-shadow-none !tw-bg-cover tw-bg-center tw-bg-no-repeat tw-aspect-[731/705]"
      :style="{ backgroundImage: `url(&quot;${bgPopup}&quot;)` }"
      color="transparent"
      flat
    >
      <v-card-text class="tw-text-center !tw-p-[3%]">
        <div
          class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-h-full"
        >
          <div class="tw-aspect-[349/194] tw-w-[50.8%] tw-mb-[2%]">
            <v-img :src="energy" width="100%" class="" />
          </div>

          <!-- Cha trực tiếp của SVG -->
          <div class="tw-w-[30%] tw-aspect-[200/90] tw-h-auto tw-mb-[8%]">
            <svg
              viewBox="0 0 200 75"
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid meet"
            >
              <text
                x="50%"
                y="50%"
                dominant-baseline="middle"
                text-anchor="middle"
                font-family="DynaPuff"
                font-size="75"
                font-weight="700"
                fill="#fff"
                stroke="#000"
                stroke-width="15"
                paint-order="stroke fill"
              >
                100
              </text>
            </svg>
          </div>

          <v-btn
            flat
            color="transparent"
            class="tw-aspect-[352/113] tw-w-[51.23%] !tw-h-auto tw-bg-contain tw-bg-center tw-bg-no-repeat tw-relative tw-rounded-[10%] tw-overflow-hidden"
            :style="{ backgroundImage: `url(${btnClaim})` }"
            @click.stop="closeDialog"
          ></v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style lang="postcss" scoped></style>
