<script setup>
import treasureGate from "@images/game/treasure-gate.png";
import treasureKapy from "@images/game/treasure-kapy.png";
import btnExplre from "@images/game/btn-explore.png";
import treasureLight from "@images/game/treasure-light.png";
import comingSoonText from "@images/game/coming-soon-text.png";
import modeGolden from "@images/game/mode-golden.png";
import modePk from "@images/game/mode-pk.png";
import modeMonster from "@images/game/mode-monster.png";

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
      class="tw-w-full tw-h-full tw-flex tw-flex-col tw-items-center tw-justify-between tw-px-[8%] tw-py-[5%] tw-bg-cover tw-bg-top tw-bg-no-repeat tw-relative"
    >
      <v-img
        :src="treasureLight"
        class="!tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-full rotate-center-infinite"
      />
      <div
        class="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-full tw-flex tw-flex-col tw-items-center tw-justify-between tw-bg-cover tw-bg-top tw-bg-no-repeat"
        :style="{ backgroundImage: `url(${treasureGate})` }"
      ></div>
      <v-img :src="treasureKapy" class="tw-w-full tw-mt-[70%]" />
      <div
        class="tw-w-full tw-flex tw-flex-col tw-justify-center tw-items-center tw-relative"
      >
        <v-img
          :src="comingSoonText"
          class="tw-w-[50%] tw-h-auto !tw-absolute -tw-top-[20%]"
        />
        <v-btn
          flat
          color="transparent"
          class="tw-aspect-[360/180] tw-w-[50%] !tw-h-auto tw-ml-[2%] tw-bg-contain tw-bg-center tw-bg-no-repeat tw-relative disable-element"
          :style="{ backgroundImage: `url(${btnExplre})` }"
        ></v-btn>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped></style>
