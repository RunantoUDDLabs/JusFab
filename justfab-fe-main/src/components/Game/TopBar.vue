<script setup>
import bgCoin from "@images/game/bg-coin.png";
import bgGold from "@images/game/bg-gold.png";
import bgAvt from "@images/game/bg-avt.png";
import defaultAvatart from "@images/game/default-avatar.png";
import bgUserState from "@images/game/bg-user-state.png";
import gold from "@images/game/gold-2.png";
import coin from "@images/game/coin-2.png";

const userStore = useUserStore();
const gameStore = useGameStore();

const currentGold = ref(userStore.userData?.gold || 0);
const currentCoin = ref(userStore.userData?.token || 0);
const goldSvgRef = ref(null);
const coinSvgRef = ref(null);
const nameSvgRef = ref(null);
const expSvgRef = ref(null);
const updatingGold = ref(false);
const updatingToken = ref(false);

onMounted(async () => {
  await gameStore.getKapyDetails();
});

const displayName = computed(() =>
  truncateString(userStore.userData?.displayName, 15)
);

watch(
  () => userStore.userData?.gold,
  async (newGold, oldGold) => {
    if (newGold !== oldGold) {
      if (updatingGold.value) {
        updatingGold.value = false;

        await nextTick();
      }

      updatingGold.value = true;

      await delay(1000);

      updatingGold.value = false;

      animateCounter(oldGold, newGold, 1000, (currentValue) => {
        currentGold.value = currentValue;
      });
    }
  }
);

watch(
  () => userStore.userData?.token,
  async (newCoin, oldCoin) => {
    if (newCoin !== oldCoin) {
      if (updatingToken.value) {
        updatingToken.value = false;

        await nextTick();
      }

      updatingToken.value = true;

      await delay(1000);

      updatingToken.value = false;

      animateCounter(oldCoin, newCoin, 1000, (currentValue) => {
        currentCoin.value = currentValue;
      });
    }
  }
);
</script>

<template>
  <div class="top-bar tw-flex tw-items-start tw-px-[3%] tw-pt-1 tw-z-10">
    <div
      class="top-icon tw-mr-[1%] tw-w-[35%] tw-bg-contain tw-bg-center tw-bg-no-repeat tw-relative tw-flex tw-items-center tw-flex-auto"
    >
      <div class="tw-w-[30%] tw-z-[1]">
        <v-avatar class="!tw-w-full !tw-h-auto tw-aspect-square">
          <v-img
            :src="userStore.userData?.avatar || defaultAvatart"
            cover
            class="tw-aspect-[1/1] tw-w-full tw-h-full"
          />
        </v-avatar>
      </div>
      <div
        class="!tw-h-[35%] !tw-w-auto tw-aspect-[147/36] tw-absolute tw-left-[20%] tw-bottom-[22%]"
      >
        <v-img :src="bgUserState" cover />
      </div>

      <div
        class="username tw-font-bold tw-text-white tw-absolute tw-top-[16%] -tw-translate-y-[16%] tw-left-0 tw-right-0 tw-ml-[30%] tw-h-[30%] tw-line-clamp-1 tw-overflow-hidden tw-text-ellipsis"
      >
        <svg
          viewBox="0 0 100 20"
          xmlns="http://www.w3.org/2000/svg"
          class="tw-w-full tw-h-full"
          ref="nameSvgRef"
        >
          <text
            x="-25%"
            y="25%"
            dominant-baseline="hanging"
            text-anchor="start"
            font-family="DynaPuff"
            :font-size="`${
              gameStore.setFontSizeBasedOnViewBox(nameSvgRef, 60) * 1.3
            }px`"
            font-weight="700"
            fill="#fff"
            stroke="#000"
            stroke-width="1.8"
            paint-order="stroke fill"
            text-overflow="ellipsis"
            white-space="nowrap"
            overflow="hidden"
            width="100%"
          >
            {{ displayName }}
          </text>
        </svg>
      </div>

      <div
        class="tw-font-bold tw-text-white tw-absolute tw-top-[66%] -tw-translate-y-[66%] tw-left-0 tw-right-0 tw-ml-[30%] tw-text-center tw-flex tw-justify-center tw-items-center tw-w-[30%] tw-h-[35%]"
      >
        <svg
          viewBox="0 0 68 18"
          xmlns="http://www.w3.org/2000/svg"
          class="tw-w-full tw-h-full"
          ref="expSvgRef"
        >
          <text
            x="50%"
            y="50%"
            dominant-baseline="middle"
            text-anchor="middle"
            font-family="DynaPuff"
            :font-size="`${
              gameStore.setFontSizeBasedOnViewBox(expSvgRef, 60) * 1.8
            }px`"
            font-weight="700"
            fill="#fff"
            stroke="#000"
            stroke-width="1.8"
            paint-order="stroke fill"
          >
            {{ gameStore.combatPower || 0 }}
          </text>
        </svg>
      </div>
    </div>
    <!-- <div
      class="top-icon tw-mr-[1%] tw-w-[32.96%] tw-aspect-[446/218] tw-bg-contain tw-bg-center tw-bg-no-repeat tw-relative"
      :style="{ backgroundImage: `url(${bgAvt})` }"
    >
      <div
        class="username tw-font-bold tw-text-white tw-absolute tw-top-[30%] -tw-translate-y-[30%] tw-left-0 tw-right-0 tw-ml-[50%] tw-line-clamp-1 tw-overflow-hidden tw-text-ellipsis"
      >
        <svg
          viewBox="0 0 68 15"
          xmlns="http://www.w3.org/2000/svg"
          class="tw-w-full tw-h-full"
          ref="nameSvgRef"
        >
          <text
            x="1%"
            y="50%"
            dominant-baseline="middle"
            text-anchor="start"
            font-family="DynaPuff"
            :font-size="`${
              gameStore.setFontSizeBasedOnViewBox(nameSvgRef, 60) * 1.3
            }px`"
            font-weight="700"
            padding-left="1%"
            fill="#fff"
            stroke="#000"
            stroke-width="1.8"
            paint-order="stroke fill"
            text-overflow="ellipsis"
            white-space="nowrap"
            overflow="hidden"
            width="100%"
          >
            {{ displayName }}
          </text>
        </svg>
      </div>

      <div
        class="tw-font-bold tw-text-white tw-absolute tw-top-[60%] -tw-translate-y-[60%] tw-left-0 tw-right-0 tw-text-center tw-ml-[50%] tw-flex tw-justify-center tw-items-center"
      >
        <svg
          viewBox="0 0 68 18"
          xmlns="http://www.w3.org/2000/svg"
          class="tw-w-full tw-h-full"
          ref="expSvgRef"
        >
          <text
            x="50%"
            y="50%"
            dominant-baseline="middle"
            text-anchor="middle"
            font-family="DynaPuff"
            :font-size="`${
              gameStore.setFontSizeBasedOnViewBox(expSvgRef, 60) * 1.3
            }px`"
            font-weight="700"
            fill="#fff"
            stroke="#000"
            stroke-width="1.8"
            paint-order="stroke fill"
          >
            {{ gameStore.combatPower || 0 }}
          </text>
        </svg>
      </div>
    </div> -->

    <div
      class="top-icon tw-mr-[4%] tw-mt-[2%] tw-w-[20%] tw-aspect-[269/104] tw-bg-contain tw-bg-center tw-bg-no-repeat tw-relative tw-flex tw-items-center"
    >
      <div class="tw-aspect-[408/440] tw-w-[30%] tw-z-[1]">
        <v-img :src="gold" cover />
      </div>

      <div
        class="!tw-h-[60%] !tw-w-auto tw-aspect-[147/36] tw-absolute tw-left-[5%] tw-bottom-[22%]"
      >
        <v-img :src="bgUserState" cover />
      </div>

      <div
        class="tw-font-bold tw-text-white tw-absolute tw-top-[50%] -tw-translate-y-1/2 tw-left-0 tw-right-0 tw-text-center tw-ml-[30%] -tw-mt-[1%] tw-flex tw-justify-center tw-items-center"
      >
        <svg
          viewBox="0 0 68 23"
          xmlns="http://www.w3.org/2000/svg"
          class="tw-w-full tw-h-full"
          :class="{ 'jello-horizontal': updatingGold }"
          ref="goldSvgRef"
        >
          <text
            x="50%"
            y="50%"
            dominant-baseline="middle"
            text-anchor="middle"
            font-family="DynaPuff"
            :font-size="`${
              gameStore.setFontSizeBasedOnViewBox(goldSvgRef, 60) * 1.6
            }px`"
            font-weight="700"
            fill="#fff"
            stroke="#000"
            stroke-width="1.8"
            paint-order="stroke fill"
          >
            {{ formatNumber(currentGold) }}
          </text>
        </svg>
      </div>
    </div>

    <!-- <div
      class="top-icon tw-mr-[4%] tw-mt-[2%] tw-w-[20%] tw-aspect-[269/104] tw-bg-contain tw-bg-center tw-bg-no-repeat tw-relative"
      :style="{ backgroundImage: `url(${bgGold})` }"
    >
      <div
        class="tw-font-bold tw-text-white tw-absolute tw-top-[50%] -tw-translate-y-1/2 tw-left-0 tw-right-0 tw-text-center tw-ml-[37%] -tw-mt-[1%] tw-flex tw-justify-center tw-items-center"
      >
        <svg
          viewBox="0 0 68 23"
          xmlns="http://www.w3.org/2000/svg"
          class="tw-w-full tw-h-full"
          :class="{ 'jello-horizontal': updatingGold }"
          ref="goldSvgRef"
        >
          <text
            x="50%"
            y="50%"
            dominant-baseline="middle"
            text-anchor="middle"
            font-family="DynaPuff"
            :font-size="`${
              gameStore.setFontSizeBasedOnViewBox(goldSvgRef, 60) * 1.3
            }px`"
            font-weight="700"
            fill="#fff"
            stroke="#000"
            stroke-width="1.8"
            paint-order="stroke fill"
          >
            {{ currentGold }}
          </text>
        </svg>
      </div>
    </div> -->

    <div
      class="top-icon tw-mt-[2%] tw-w-[19.28%] tw-aspect-[261/100] tw-bg-contain tw-bg-center tw-bg-no-repeat tw-relative tw-flex tw-items-center"
    >
      <div class="tw-aspect-[104/101] tw-w-[30%] tw-z-[1]">
        <v-img :src="coin" cover />
      </div>
      <div
        class="!tw-h-[60%] !tw-w-auto tw-aspect-[147/36] tw-absolute tw-left-[5%] tw-bottom-[22%]"
      >
        <v-img :src="bgUserState" cover />
      </div>
      <div
        class="tw-font-bold tw-text-white tw-absolute tw-top-[50%] -tw-translate-y-1/2 tw-left-0 tw-right-0 tw-text-center tw-ml-[25%] tw-mt-[1%] tw-flex tw-justify-center tw-items-center"
      >
        <svg
          viewBox="0 0 68 23"
          xmlns="http://www.w3.org/2000/svg"
          class="tw-w-full tw-h-full"
          :class="{ 'jello-horizontal': updatingToken }"
          ref="coinSvgRef"
        >
          <text
            x="50%"
            y="50%"
            dominant-baseline="middle"
            text-anchor="middle"
            font-family="DynaPuff"
            :font-size="`${
              gameStore.setFontSizeBasedOnViewBox(coinSvgRef, 60) * 1.6
            }px`"
            font-weight="700"
            fill="#fff"
            stroke="#000"
            stroke-width="1.8"
            paint-order="stroke fill"
          >
            {{ formatNumber(currentCoin) }}
          </text>
        </svg>
      </div>
    </div>
    <!-- <div
      class="top-icon tw-mt-[2%] tw-w-[19.28%] tw-aspect-[261/100] tw-bg-contain tw-bg-center tw-bg-no-repeat tw-relative"
      :style="{ backgroundImage: `url(${bgCoin})` }"
    >
      <div
        class="tw-font-bold tw-text-white tw-absolute tw-top-[50%] -tw-translate-y-1/2 tw-left-0 tw-right-0 tw-text-center tw-ml-[37%] tw-mt-[1%] tw-flex tw-justify-center tw-items-center"
      >
        <svg
          viewBox="0 0 68 25"
          xmlns="http://www.w3.org/2000/svg"
          class="tw-w-full tw-h-full"
          :class="{ 'jello-horizontal': updatingToken }"
          ref="coinSvgRef"
        >
          <text
            x="50%"
            y="50%"
            dominant-baseline="middle"
            text-anchor="middle"
            font-family="DynaPuff"
            :font-size="`${
              gameStore.setFontSizeBasedOnViewBox(coinSvgRef, 60) * 1.3
            }px`"
            font-weight="700"
            fill="#fff"
            stroke="#000"
            stroke-width="1.8"
            paint-order="stroke fill"
          >
            {{ currentCoin }}
          </text>
        </svg>
      </div>
    </div> -->
  </div>
</template>
