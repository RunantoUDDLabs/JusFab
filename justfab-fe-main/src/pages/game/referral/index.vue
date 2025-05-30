<script setup>
import gameBg from "@images/game/bg-game-2.png";
import inviteFriends from "@images/game/invite-friends.png";
import btnInvite from "@images/game/btn-invite.png";
import invitedReward1 from "@images/game/invited-reward-1.png";
import invitedReward2 from "@images/game/invited-reward-2.png";
import invitedReward3 from "@images/game/invited-reward-3.png";
import invitedReward4 from "@images/game/invited-reward-4.png";
import invitedReward5 from "@images/game/invited-reward-5.png";
import invitedReward6 from "@images/game/invited-reward-6.png";
import invitedReward7 from "@images/game/invited-reward-7.png";
import invitedReward8 from "@images/game/invited-reward-8.png";
import invitedReward9 from "@images/game/invited-reward-9.png";
import invitedReward10 from "@images/game/invited-reward-10.png";
import invitedReward11 from "@images/game/invited-reward-11.png";
import invitedReward12 from "@images/game/invited-reward-12.png";
import iconCheckedIn from "@images/game/icon-checked-in.png";
import { emitter } from "@plugins/mitt";

definePage({
  meta: {
    layout: "game",
    requiresAuth: true,
    subject: "User",
    action: "read",
  },
});

const specialLevels = [
  { count: 1, image: invitedReward1 },
  { count: 2, image: invitedReward2 },
  { count: 3, image: invitedReward3 },
  { count: 10, image: invitedReward4 },
  { count: 20, image: invitedReward5 },
  { count: 50, image: invitedReward6 },
  { count: 100, image: invitedReward7 },
  { count: 200, image: invitedReward8 },
  { count: 500, image: invitedReward9 },
  { count: 1000, image: invitedReward10 },
  { count: 2000, image: invitedReward11 },
  { count: 3000, image: invitedReward12 },
];

const gameStore = useGameStore();
const userStore = useUserStore();

const gameContentRef = ref(null);
const inviteDialogRef = ref(null);
const claimInviteDialogRef = ref(null);
const parentDivWidth = ref(0);
const invitedSvgRef = ref(null);
const recruited = ref(0);
const notClaimed = ref([]);

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

let resizeObserver;
const { observe } = useMixin();

const handleResize = (newWidth) => {
  parentDivWidth.value = newWidth;
};

onMounted(async () => {
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

  await getRecruited();

  emitter.on("onClaimeReferralSuccess", () => getRecruited());
});

const onResizeWindow = () => {
  if (gameContentRef.value) {
    observe(gameContentRef.value, handleResize);
  }
};

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResizeWindow);
});

const submitInvite = ($event) => {
  handleNormalClickAnimation($event);
  inviteDialogRef.value.openDialog();
};

const submitClaimInvited = (level) => {
  const rewards = notClaimed.value
    .filter((item) => item.level === level)
    .map((item) => item.reward);

  gameStore.handleRewards(rewards, notClaimed.value[0].reason);

  // claimInviteDialogRef.value.openDialog();
};

const getRecruited = async () => {
  try {
    const { onboarded, rewards } = await getRecruitedUsers();
    recruited.value = onboarded;
    notClaimed.value = rewards;

    if (notClaimed.value.length > 0) {
      const rw = notClaimed.value
        .filter((item) => !specialLevels.some((sp) => sp.count === item.level))
        .map((item) => item.reward);

      if (rw.length > 0) {
        gameStore.handleRewards(rw, notClaimed.value[0].reason);
      }
    }
  } catch (error) {
    console.log("error", error);
  }
};
</script>

<template>
  <div
    ref="gameContentRef"
    class="game-content tw-flex-grow tw-flex tw-justify-center tw-items-center"
  >
    <div
      class="tw-aspect-[1012/1320] tw-w-[95%] tw-h-auto tw-bg-cover tw-bg-center tw-bg-no-repeat tw-flex tw-flex-col"
      :style="{ backgroundImage: `url(${inviteFriends})` }"
    >
      <div class="tw-flex-auto">
        <div class="tw-flex-auto tw-aspect-[1080/650] tw-w-full"></div>
        <div class="tw-aspect-[1080/80] tw-w-full">
          <svg
            viewBox="0 0 68 15"
            xmlns="http://www.w3.org/2000/svg"
            class="tw-w-full tw-h-full"
            ref="invitedSvgRef"
          >
            <text
              x="100%"
              y="55%"
              dominant-baseline="middle"
              text-anchor="start"
              font-family="DynaPuff"
              :font-size="`${gameStore.setFontSizeBasedOnViewBox(
                invitedSvgRef,
                60
              )}px`"
              font-weight="700"
              fill="#fff"
              stroke="#B24400"
              stroke-width="1.5"
              paint-order="stroke fill"
              text-overflow="ellipsis"
              white-space="nowrap"
              overflow="hidden"
              width="100%"
            >
              {{ recruited }}
            </text>
          </svg>
        </div>

        <div class="tw-flex-auto tw-aspect-[1080/300] tw-w-full tw-px-[12%]">
          <div
            class="tw-h-full tw-grid tw-grid-cols-6 tw-grid-rows-2 tw-gap-[2%]"
          >
            <v-img
              v-for="(level, index) in specialLevels"
              :key="index"
              :src="level.image"
              :class="{
                'tw-cursor-pointer': canClaimLevels.includes(level.count),
                'disable-element':
                  !canClaimLevels.includes(level.count) &&
                  !claimedLevels.includes(level.count),
              }"
              class="tw-w-full tw-h-full [&_.v-responsive\_\_content]:tw-flex [&_.v-responsive\_\_content]:tw-justify-center [&_.v-responsive\_\_content]:tw-items-center"
              @click.prevent="
                canClaimLevels.includes(level.count)
                  ? submitClaimInvited(level.count)
                  : ''
              "
            >
              <v-img
                :src="iconCheckedIn"
                class="!tw-max-w-[70%] tw-h-auto"
                :class="{
                  '!tw-flex': claimedLevels.includes(level.count),
                  '!tw-hidden': !claimedLevels.includes(level.count),
                }"
              />
            </v-img>
          </div>
        </div>
      </div>
      <div
        class="tw-mb-[3%] tw-w-full tw-flex tw-justify-center tw-items-center"
      >
        <v-btn
          flat
          color="transparent"
          class="tw-aspect-[380/96] tw-w-[35.2%] !tw-h-auto tw-bg-contain tw-bg-center tw-bg-no-repeat tw-relative tw-rounded-[10%] tw-overflow-hidden"
          :style="{ backgroundImage: `url(${btnInvite})` }"
          @click.stop="submitInvite"
        ></v-btn>
      </div>
      <!-- <div class="tw-aspect-[1080/150]"></div> -->
    </div>

    <invite-dialog ref="inviteDialogRef" :width="parentDivWidth * 0.79" />
    <claim-invite-dialog
      ref="claimInviteDialogRef"
      :width="parentDivWidth * 0.79"
    />
  </div>
</template>

<style lang="postcss" scoped>
.received {
  filter: grayscale(100%);
  opacity: 0.7;
}
</style>
