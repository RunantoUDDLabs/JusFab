<script setup>
import bgReferred from "@images/game/bg-referred.png";
import completedDailyReward from "@images/game/completed-daily-reward.png";
import { emitter } from "@plugins/mitt";

const gameStore = useGameStore();
const userStore = useUserStore();

const specialLevels = [
  { count: 1 },
  { count: 2 },
  { count: 3 },
  { count: 10 },
  { count: 20 },
  { count: 50 },
  { count: 100 },
  { count: 200 },
  { count: 500 },
  { count: 1000 },
  { count: 2000 },
  { count: 3000 },
];

const gameContentRef = ref(null);
const inviteDialogRef = ref(null);
const claimInviteDialogRef = ref(null);
const parentDivWidth = ref(0);
const invitedSvgRef = ref(null);
const recruited = ref(0);
const notClaimed = ref([]);
const sumRewards = ref([]);

const referred = ref([]);

const canClaimLevels = computed(() => {
  const specialCounts = new Set(specialLevels.map((sp) => sp.count));

  return [
    ...new Set(
      notClaimed.value
        .map((item) => item.level)
        .filter((level) => specialCounts.has(level))
    ),
  ];
});

const claimedLevels = computed(() => {
  const notClaimedSet = new Set(notClaimed.value.map((item) => item.level));

  return specialLevels
    .map((sp) => sp.count)
    .filter((count) => count <= recruited.value && !notClaimedSet.has(count));
});

onMounted(async () => {
  // const { referredUsers } = await getReferralTree(userStore.userData?._id);
  // referred.value = referredUsers;
  await getRecruited();

  emitter.on("onClaimeReferralSuccess", () => getRecruited());
});

const submitClaimInvited = (level) => {
  const rewards = notClaimed.value
    .filter((item) => item.level === level)
    .map((item) => item.reward);

  gameStore.handleRewards(rewards, notClaimed.value[0].reason);

  // claimInviteDialogRef.value.openDialog();
};

const getRecruited = async () => {
  try {
    const { onboarded, rewards, sumRewards } = await getRecruitedUsers();
    recruited.value = onboarded;
    notClaimed.value = rewards;
    sumRewards.value = sumRewards;
    if (notClaimed.value.length > 0) {
      const rw = notClaimed.value
        .filter((item) => !specialLevels.some((sp) => sp.count === item.level))
        .map((item) => item.reward);

      if (rw.length > 0) {
        gameStore.handleRewards(rw, notClaimed.value[0].reason);
      }
    }

    if (sumRewards.value.length > 0) {
      const rw = sumRewards.value.map((item) => item.reward);

      if (rw.length > 0) {
        gameStore.handleRewards(rw, "no-claim");
      }
    }
  } catch (error) {
    console.log("error", error);
  }
};
</script>

<template>
  <div class="tw-flex tw-flex-col tw-gap-[2%]">
    <div
      v-for="(level, index) in specialLevels"
      :key="index"
      class="tw-bg-cover tw-bg-center tw-bg-no-repeat tw-aspect-[608/152] tw-w-full tw-flex tw-items-center tw-text-[#AE613A] tw-relative"
      :class="{
        'tw-cursor-pointer': canClaimLevels.includes(level.count),
        'disable-element':
          !canClaimLevels.includes(level.count) &&
          !claimedLevels.includes(level.count),
      }"
      :style="{ backgroundImage: `url(${bgReferred})` }"
      @click.prevent="
        canClaimLevels.includes(level.count)
          ? submitClaimInvited(level.count)
          : ''
      "
    >
      <div class="tw-w-[78%] tw-ml-auto tw-mb-[4%] tw-line-clamp-2">
        Invite {{ level.count }} Friend To Unlock The Rewards
      </div>

      <div
        v-if="claimedLevels.includes(level.count)"
        class="task-completed tw-absolute tw-left-[.3%] tw-top-0 tw-w-[99.5%] tw-h-[87%] tw-flex tw-justify-center tw-items-center"
      >
        <div class="tw-h-1/2 tw-w-auto tw-aspect-square">
          <v-img :src="completedDailyReward" cover />
        </div>
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
