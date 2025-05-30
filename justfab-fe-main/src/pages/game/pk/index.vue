<script setup>
import modeGolden from "@images/game/mode-golden.png";
import modePk from "@images/game/mode-pk.png";
import modeMonster from "@images/game/mode-monster.png";
import { ref } from "vue";

definePage({
  meta: {
    layout: "game",
    requiresAuth: true,
    subject: "User",
    action: "read",
  },
});
let resizeObserver;

const settingDialogRef = ref(null);
const gameContentRef = ref(null);
const parentDivWidth = ref(0);
const comingSoon = ref(false);
const comingSoonOverlayRef = ref(null);

const { observe } = useMixin();

const handleResize = (newWidth) => {
  parentDivWidth.value = newWidth;
};

onMounted(() => {
  nextTick(() => {
    if (gameContentRef.value) {
      observe(gameContentRef.value, handleResize);
    }
    window.addEventListener("resize", onResizeWindow);
  });

  // if (gameContentRef.value) {
  //   resizeObserver = new ResizeObserver((entries) => {
  //     for (let entry of entries) {
  //       parentDivWidth.value = entry.contentRect.width;
  //     }
  //   });

  //   resizeObserver.observe(gameContentRef.value);
  // }
});

const onResizeWindow = () => {
  if (gameContentRef.value) {
    observe(gameContentRef.value, handleResize);
  }
};

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResizeWindow);
});

onUnmounted(() => {});

const submitOpenSettingDialog = () => {
  settingDialogRef.value.openDialog();
};
</script>

<template>
  <div
    class="game-content tw-flex-auto tw-flex tw-items-center tw-justify-center tw-overflow-hidden"
    ref="gameContentRef"
  >
    <div
      class="tw-w-full tw-h-full tw-flex tw-flex-col tw-items-center tw-justify-between tw-gap-4 tw-px-[8%] tw-py-[10%]"
    >
      <div
        class="tw-aspect-[586/287] tw-max-w-full tw-max-h-full tw-h-full"
        @click="comingSoonOverlayRef.openOverlay"
      >
        <v-img :src="modePk" cover />
      </div>

      <div
        class="tw-aspect-[586/287] tw-max-w-full tw-max-h-full tw-h-full"
        @click="comingSoonOverlayRef.openOverlay"
      >
        <v-img :src="modeMonster" cover />
      </div>

      <div
        class="tw-aspect-[586/287] tw-max-w-full tw-max-h-full tw-h-full"
        @click="comingSoonOverlayRef.openOverlay"
      >
        <v-img :src="modeGolden" cover />
      </div>
    </div>

    <ComingSoonOverlay ref="comingSoonOverlayRef" />
  </div>
</template>

<style lang="postcss" scoped></style>
