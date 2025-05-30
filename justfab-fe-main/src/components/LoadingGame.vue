<script setup>
import bgLoadingGame from "@images/game/bg-loading-game.png";
import loadingBar from "@images/game/loading-bar.png";

const props = defineProps({
  width: {
    type: Number,
    default: 0,
  },
});

const gameStore = useGameStore();
const isLoading = computed(() => gameStore.isLoading);
const progressLoading = computed(() => gameStore.progressLoading);

const loadingBarRef = ref(null);
const loadingNoticeRef = ref(null);
</script>

<template>
  <section id="loading">
    <v-overlay
      v-model="isLoading"
      class="tw-justify-center tw-items-center !tw-z-[2000] tw-bg-black"
      opacity="0"
    >
      <v-card
        flat
        class="tw-aspect-[9/16] tw-w-auto tw-h-screen tw-max-w-full tw-max-h-[1920px] !tw-bg-cover !tw-bg-center !tw-bg-no-repeat !tw-p-[5%]"
        :style="{ backgroundImage: `url(${bgLoadingGame})` }"
      >
        <div
          class="tw-h-full tw-flex tw-flex-col tw-justify-end tw-items-center"
        >
          <div
            class="tw-aspect-[764/99] tw-w-[764px] !tw-h-auto tw-max-w-[80%] tw-bg-cover tw-bg-center tw-bg-no-repeat tw-flex tw-justify-center tw-items-center"
            :style="{ backgroundImage: `url(${loadingBar})` }"
          >
            <v-progress-linear
              color="cyan"
              indeterminate
              class="tw-w-[95%] !tw-h-[60%] tw-font-[DynaPuff]"
            >
              <svg
                viewBox="0 0 120 40"
                xmlns="http://www.w3.org/2000/svg"
                class="tw-h-full"
                ref="loadingBarRef"
              >
                <text
                  x="50%"
                  y="50%"
                  dominant-baseline="middle"
                  text-anchor="middle"
                  font-family="DynaPuff"
                  :font-size="`${gameStore.setFontSizeBasedOnViewBox(
                    loadingBarRef,
                    60
                  )}px`"
                  font-weight="700"
                  fill="#fff"
                  stroke="#000000"
                  stroke-width="5"
                  paint-order="stroke fill"
                  text-overflow="ellipsis"
                  white-space="nowrap"
                  overflow="hidden"
                  width="100%"
                >
                  Loading
                </text>
              </svg>
            </v-progress-linear>
          </div>

          <div class="tw-font-[DynaPuff]">
            <svg
              viewBox="0 0 300 30"
              xmlns="http://www.w3.org/2000/svg"
              class="tw-w-full"
              ref="loadingNoticeRef"
            >
              <text
                x="50%"
                y="50%"
                dominant-baseline="middle"
                text-anchor="middle"
                font-family="DynaPuff"
                :font-size="`${gameStore.setFontSizeBasedOnViewBox(
                  loadingNoticeRef,
                  30
                )}px`"
                font-weight="400"
                fill="#fff"
                stroke="#000000"
                stroke-width="1"
                paint-order="stroke fill"
                text-overflow="ellipsis"
                white-space="nowrap"
                overflow="hidden"
                width="100%"
              >
                <tspan x="50%" y="30%">
                  If you see an offensive message in the chat, tap it and
                </tspan>
                <tspan x="50%" y="70%">
                  choose “report” to report the player.
                </tspan>
              </text>
            </svg>
          </div>
        </div>
      </v-card>
    </v-overlay>
  </section>
</template>

<style lang="postcss" scoped></style>
