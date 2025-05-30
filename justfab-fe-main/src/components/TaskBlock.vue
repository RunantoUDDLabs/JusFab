<script setup>
import bgTask from "@images/game/bg-task.png";
import energy from "@images/game/energy.svg";
import gold from "@images/game/gold-2.png";
import completedDailyReward from "@images/game/completed-daily-reward.png";

const props = defineProps({
  task: Object,
  isCompleted: Boolean,
});

const gameStore = useGameStore();

const fontSizeBase = computed(() => gameStore.baseFontSize);

const taskRewardIcon = (rewardsType = REWARD_TYPES.GOLD) => {
  switch (rewardsType) {
    case REWARD_TYPES.JACKPOT:
    case REWARD_TYPES.FOOD:
    case REWARD_TYPES.SPIN:
      break;
    case REWARD_TYPES.TOKEN:
      break;
    case REWARD_TYPES.GOLD:
      return gold;
    case REWARD_TYPES.ITEM:
    case REWARD_TYPES.ENERGY:
      return energy;
    case REWARD_TYPES.POOL_PERCENTAGE:
      break;
    default:
      console.warn(`Unknown reward type: ${rewardsType}`);
      break;
  }
};
</script>

<template>
  <div
    :style="{ backgroundImage: `url(${bgTask})` }"
    class="tw-aspect-[956/242] tw-w-full tw-bg-cover tw-bg-center tw-bg-no-repeat tw-relative"
  >
    <div
      class="tw-w-[80%] tw-h-[70%] tw-ml-auto tw-flex tw-justify-left tw-items-center"
      :style="{
        fontSize: `${fontSizeBase}px !important`,
        '--base-font-size': `${fontSizeBase}px`,
      }"
    >
      {{ task.title }}
    </div>

    <div
      class="tw-w-full tw-h-[30%] tw-text-white tw-font-bold tw-flex tw-items-center tw-px-[4%]"
      :style="{
        fontSize: `${fontSizeBase}px !important`,
      }"
    >
      <div
        class="!tw-aspect-square !tw-w-auto !tw-h-[60%] tw-flex-none tw-flex tw-justify-center tw-items-center tw-mr-[1%]"
      >
        <v-img :src="taskRewardIcon(task.reward.type)" cover />
      </div>
      <div class="tw-flex-auto">x {{ task.reward.value }}</div>
    </div>

    <div
      v-if="isCompleted"
      class="task-completed tw-absolute tw-left-0 tw-top-0 tw-w-full tw-h-full tw-flex tw-justify-center tw-items-center"
    >
      <div class="tw-h-1/2 tw-w-auto tw-aspect-square">
        <v-img :src="completedDailyReward" cover />
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.task-completed {
  @apply tw-bg-black/50 tw-rounded-[1em];
  z-index: 1;
}
</style>
