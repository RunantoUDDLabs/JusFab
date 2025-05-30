<script setup>
import bgLoadingGame from "@images/game/bg-loading-game.png";
import { onBeforeMount, onUnmounted } from "vue";

definePage({
  meta: {
    layout: "blank",
    public: true,
  },
});

const gameStore = useGameStore();

onBeforeMount(() => {
  gameStore.setLoading(true);
});

onUnmounted(() => {
  gameStore.setLoading(false);
});
</script>

<template>
  <div
    class="tw-bg-[#86C7E5] tw-w-screen tw-h-screen tw-flex tw-items-center tw-justify-center"
  >
    <div
      class="game-container tw-w-auto tw-h-[1920px] tw-aspect-[9/16] tw-max-w-full tw-max-h-full tw-bg-[#D9D9D9] tw-bg-cover tw-bg-center tw-bg-no-repeat tw-flex tw-flex-col tw-relative"
      :style="{ backgroundImage: `url(${bgLoadingGame})` }"
    >
      <div
        class="game-content tw-flex-grow tw-flex tw-justify-center tw-items-center tw-text-white"
      >
        Loading...
      </div>
    </div>
  </div>
</template>
