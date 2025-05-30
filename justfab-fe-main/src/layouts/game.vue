<script setup>
import LoadingGame from "@/components/LoadingGame.vue";
import gameBg from "@images/game/bg-game-2.png";
import { emitter } from "@plugins/mitt";

const gameStore = useGameStore();

let intervalId = null;
let resizeObserver;

const gameContainerRef = ref(null);
const isClaimingRewards = ref(false);
const containerDivWidth = ref(0);
const resultItemDialogWidth = ref();
const viewportHeight = ref();
const safeArea = ref({ top: 0, bottom: 0 });
// const resultItemDialogWidth = computed({
//   get: () => 0,
//   set: (val) => console.log("temp", val),
// });

const fontSizeBase = computed(() => gameStore.baseFontSize);
const containerWidth = computed(() => gameStore.parentWidth);
const resultItemDialogRef = computed(() => gameStore.resultItemDialogRef);
// const resultItemDialogWidth = computed(() => containerDivWidth.value * 0.79);

const { observe } = useMixin();

const handleResize = (newWidth) => {
  containerDivWidth.value = newWidth;
  resultItemDialogWidth.value = newWidth * 0.79;

  gameStore.gameContainer = gameContainerRef.value;
  gameStore.baseFontSize = gameStore.setResponsiveFont();
};

onMounted(() => {
  gameStore.setLoading(true);

  // const removeListener = on("viewport_changed", updateViewportHeight);

  // startClaiming();
  // document.addEventListener("visibilitychange", () => {
  //   if (document.visibilityState === "visible") {
  //     startClaiming();
  //   } else {
  //     stopClaiming();
  //   }
  // });

  gameStore.gameContainer = gameContainerRef.value;
  gameStore.baseFontSize = gameStore.setResponsiveFont();

  nextTick(() => {
    if (gameContainerRef.value) {
      observe(gameContainerRef.value, handleResize);
    }
    window.addEventListener("resize", onResizeWindow);
  });
  // if (gameContainerRef.value) {
  //   resizeObserver = new ResizeObserver((entries) => {
  //     for (let entry of entries) {
  //       containerDivWidth.value = entry.contentRect.width;
  //       resultItemDialogWidth.value = containerDivWidth.value * 0.79;
  //     }
  //   });

  //   resizeObserver.observe(gameContainerRef.value);
  // }

  gameStore.setLoading(false);

  gameStore.setWelcome(true);
});

const onResizeWindow = () => {
  if (gameContainerRef.value) {
    observe(gameContainerRef.value, handleResize);
  }
};

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResizeWindow);
});

onUnmounted(() => {
  // stopClaiming();
  // document.removeEventListener("visibilitychange", stopClaiming);
});

// const executeClaimRewards = async () => {
//   if (isClaimingRewards.value) return;

//   try {
//     isClaimingRewards.value = true;
//     console.log("Executing claim rewards...");
//     const { rewards } = await claimAllRewards();

//     gameStore.handleRewards(rewards);
//   } catch (error) {
//     console.error("Error while claiming rewards:", error);
//   } finally {
//     isClaimingRewards.value = false;
//   }
// };

// const startClaiming = () => {
//   if (!intervalId) {
//     executeClaimRewards();
//     intervalId = setInterval(async () => {
//       if (document.visibilityState === "visible") {
//         await executeClaimRewards();
//       }
//     }, 5000);
//   }
// };

// const stopClaiming = () => {
//   if (intervalId) {
//     clearInterval(intervalId);
//     intervalId = null;
//   }
// };

const resetRewardsState = () => {
  emitter.emit("reset-rewards-state");
};
</script>

<template>
  <div class="tw-h-full game-layout">
    <div
      class="tw-bg-[#86C7E5] tw-w-screen tw-flex tw-items-center tw-justify-center tw-fixed"
    >
      <div
        class="game-container tw-w-auto tw-h-[1920px] tw-aspect-[9/16] tw-max-w-full tw-max-h-screen tw-bg-[#D9D9D9] tw-bg-cover tw-bg-center tw-bg-no-repeat tw-flex tw-flex-col tw-relative"
        :style="{
          backgroundImage: `url(${gameBg})`,
          fontSize: `${fontSizeBase}px`,
          '--base-font-size': `${fontSizeBase}px`,
          '--container-width': `${containerWidth}px`,
        }"
        ref="gameContainerRef"
      >
        <!-- Top Icons -->
        <top-bar />

        <RouterView #="{ Component }">
          <Component :is="Component" />
        </RouterView>

        <!-- Bottom Icons -->
        <bottom-bar />
      </div>
    </div>

    <AudioSource />
    <LoadingGame />
    <WelcomeOverlay :width="containerWidth" />

    <result-item-dialog
      ref="resultItemDialogRef"
      :width="resultItemDialogWidth"
      @onClose="resetRewardsState"
    />
  </div>
</template>
