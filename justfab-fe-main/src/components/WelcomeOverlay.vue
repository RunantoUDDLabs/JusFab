<script setup>
import bgWelcome from "@images/game/welcome-loading.jpg";

const props = defineProps({
  width: {
    type: Number,
    default: 0,
  },
});

const gameStore = useGameStore();
const isWelcome = computed(() => gameStore.isWelcome);
watch(isWelcome, (val) => {
  console.log(val);
  if (val) {
    setTimeout(() => {
      gameStore.setWelcome(false);
    }, 1500);
  }
});
</script>

<template>
  <section id="welcome">
    <v-overlay
      v-model="isWelcome"
      class="tw-justify-center tw-items-center !tw-z-[2000] tw-bg-black"
    >
      <v-card
        flat
        class="tw-aspect-[9/16] tw-h-auto tw-max-w-full tw-max-h-screen !tw-bg-cover !tw-bg-center !tw-bg-no-repeat"
        :style="{ backgroundImage: `url(${bgWelcome})` }"
        :width="width"
      >
      </v-card>
    </v-overlay>
  </section>
</template>

<style lang="postcss" scoped></style>
