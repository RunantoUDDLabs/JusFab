<script setup>
import gameBg from "@images/game/bg-game-2.png";
import inputDailyTask from "@images/game/input-daily-task.png";
import btnSegment from "@images/game/btn-segment.png";
import btnNetwork from "@images/game/btn-network.png";
import btnFriend from "@images/game/btn-friend.png";
import bgGifts from "@images/game/bg-gifts.png";
import gift1 from "@images/game/gift-1.png";
import gift2 from "@images/game/gift-2.png";
import gift3 from "@images/game/gift-3.png";
import gift4 from "@images/game/gift-4.png";
import gift5 from "@images/game/gift-5.png";
import gift6 from "@images/game/gift-6.png";
import gift7 from "@images/game/gift-7.png";
import dailyReward from "@images/game/daily-reward.png";
import bgBoxTask from "@images/game/bg-box-task.png";
import iconCheckedIn from "@images/game/icon-checked-in.png";
import dailyMission from "@images/game/daily-mission.png";
import partnersMission from "@images/game/partners-mission.png";
import friendsMission from "@images/game/friends-mission.png";
import connectMission from "@images/game/connect-mission.png";
import dailyReward2 from "@images/game/daily-reward-2.png";
import completedDailyReward from "@images/game/completed-daily-reward.png";
import aboutFp from "@images/game/about-fp.png";

import { openLink, openTelegramLink } from "@telegram-apps/sdk";
// import { openLink, openPopup, openTelegramLink } from "@telegram-apps/sdk-vue";
import moment from "moment";
import { emitter } from "@plugins/mitt";
import { computed } from "vue";

definePage({
  meta: {
    layout: "game",
    requiresAuth: true,
    subject: "User",
    action: "read",
  },
});

const { observe } = useMixin();

const gameStore = useGameStore();
const userStore = useUserStore();

const isOpen = ref(false);
const allTasks = ref([]);
const allTaskGroup = ref([]);
const userTasks = ref([]);
const currentGroupParent = ref();
const currentTask = ref();

const currentStreak = ref(0);
// const lastClaimedAt = ref(null);
const streakRewards = ref([]);
const dailyRewardRef = ref(null);
const tabsWrapperRef = ref(null);
const tabsHeight = ref(0);
const gameContainerRef = ref();
const itemsContainerWidth = ref(0);
const itemsContainerHeight = ref(0);
const lastHeight = ref(0);
const dailyContainerRef = ref();

let isDragging = false;
let startX = 0;
let scrollLeft = 0;
let moved = false;

let checkTask = null;

const fontSizeBase = computed(() => gameStore.baseFontSize);

const dailyHeight = computed(() => {
  console.log(
    "itemsContainerHeight",
    itemsContainerHeight.value,
    itemsContainerHeight.value * 0.25
  );
  return itemsContainerHeight.value * 0.25;
});

const currentIndex = computed(() => {
  // if (!currentStreak.value) {
  //   return;
  // }
  return currentStreak.value;
});

const canClaimIndexs = computed(() => {
  return streakRewards.value.reduce((acc, item) => {
    if (!acc.includes(item.level)) {
      acc.push(item.level);
    }
    return acc;
  }, []);
});

const groupsParent = computed(() => {
  return allTaskGroup.value.filter(
    (group) => !group.parent || group.parent === null
  );
});
const currentGroups = computed(() => {
  return allTaskGroup.value.filter(
    (group) => group.parent === currentGroupParent.value
  );
});
const justfabMissionTasks = computed(() =>
  allTasks.value?.filter(
    (task) => task.group === getGroupIdByName("JustFab Missions")
  )
);
const partnerChildGroups = computed(() => {
  const partner = getGroupIdByName("Partners");
  return allTaskGroup.value.filter((group) => group.parent === partner);
});

onMounted(async () => {
  // Telegram.WebApp.ready();

  const p1 = getTasks();
  const p2 = getTaskGroup();
  const p3 = getSeftTasks();
  const p4 = getDaily();

  await Promise.all([p1, p2, p3, p4]);

  await nextTick();

  if (groupsParent.value.length) {
    currentGroupParent.value = groupsParent.value[0]._id;
  }

  currentGroupParent.value = "JustFab";

  await nextTick();

  requestAnimationFrame(() => {
    if (tabsWrapperRef.value) {
      tabsHeight.value = tabsWrapperRef.value.offsetHeight;
      console.log("Tabs height:", tabsHeight.value);
    }
  });

  emitter.on("onClaimeDailySuccess", () => getDaily());

  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible") {
      if (currentTask.value && Object.keys(currentTask.value).length) {
        await getSeftTasks();

        currentTask.value = null;
      }
    }
  });

  if (gameContainerRef.value) {
    observe(gameContainerRef.value, handleResize);
  }
  window.addEventListener("resize", onResizeWindow);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResizeWindow);
});

const handleResize = (newWidth, newHeight) => {
  console.log("handleResize", newWidth, newHeight);
  if (
    newWidth !== itemsContainerWidth.value ||
    Math.abs(newHeight - lastHeight.value) > 5
  ) {
    itemsContainerWidth.value = newWidth;
    itemsContainerHeight.value = newHeight;
    lastHeight.value = newHeight;
  }
};

const onResizeWindow = () => {
  if (gameContainerRef.value) {
    observe(gameContainerRef.value, handleResize);
  }
};

const getDaily = async () => {
  try {
    const response = await getDailyReward();

    currentStreak.value = response.record.streak;
    streakRewards.value = response.rewards;
  } catch (error) {
    console.error(error);
  }
};

const getTasks = async () => {
  try {
    const tasksResponse = await getAllTasks();

    allTasks.value = tasksResponse;
  } catch (error) {
    console.error(error);
  }
};

const getTaskGroup = async () => {
  try {
    const tasksResponse = await getAllTaskGroups();

    allTaskGroup.value = tasksResponse;
  } catch (error) {
    console.error(error);
  }
};

const getSeftTasks = async () => {
  try {
    const tasksResponse = await getUserTasks();

    userTasks.value = tasksResponse.task;

    if (tasksResponse.rewards.length) {
      tasksResponse.rewards.forEach((item) => {
        gameStore.handleRewards([item.reward], "task");
      });
    }
  } catch (error) {
    console.error(error);
  }
};

const getGroupIdByName = (name) => {
  const group = allTaskGroup.value.find((g) => g.name === name);

  return group?._id;
};

const getTaskByGroup = (groupId) => {
  return allTasks.value.filter((task) => task.group === groupId);
};

const getTaskByGroupName = (groupId) => {
  return allTasks.value.filter((task) => task.group === groupId);
};

const getGroupsInParentGroupByName = (parentName) => {
  const parentId = getGroupIdByName("JustFab Missions");
  return allTaskGroup.value.filter((group) => group.parent === parentName);
};

const isCompleted = (taskId) => {
  return userTasks.value.some(
    (task) => task.task === taskId && task.status === "COMPLETED"
  );
};

const doTask = async (task) => {
  try {
    switch (task.type) {
      case TASK_TYPES.TELEGRAM: {
        currentTask.value = task;

        if (openTelegramLink.isAvailable()) {
          openTelegramLink(`https://t.me/${task.target}`);
        } else {
          window.open(`https://t.me/${task.target}`, "_blank");
        }

        // if (window.Telegram?.WebApp) {
        //   window.Telegram.WebApp.openTelegramLink(
        //     `https://t.me/${task.target}`
        //   );
        // } else {
        //   window.open(`https://t.me/${task.target}`, "_blank");
        // }

        break;
      }
      case TASK_TYPES.LINK: {
        currentTask.value = task;

        if (openLink.isAvailable()) {
          openLink(task.target, {
            tryInstantView: true,
          });
          // Telegram.WebApp.openLink(task.target, { try_instant_view: true });
        } else {
          window.open(task.target, "_blank");
        }

        // if (window.Telegram?.WebApp) {
        //   window.Telegram.WebApp.openLink(task.target, {
        //     try_instant_view: true,
        //   });
        // } else {
        //   window.open(`https://t.me/${task.target}`, "_blank");
        // }

        await completeTask(task._id);

        await delay(3000);

        // await getSeftTasks();

        // gameStore.handleRewards([task.reward], "task");
        break;
      }
      default:
        console.warn(`Unknown reward type: ${reward.type}`);
        break;
    }
  } catch (error) {
    console.error(error);
  }
};

const handleDailyCheckIn = ($event, level) => {
  if (moved) return;
  toggleClass(
    $event,
    "tw-animate-jump tw-animate-once tw-animate-ease-linear tw-animate-duration-[1000ms]",
    1000
  );

  const rewards = streakRewards.value
    .filter((item) => item.level === level)
    .map((item) => item.reward);

  gameStore.handleRewards(rewards, "daily");
};

// const onClaimReward = async () => {
//   try {
//     await claimDailyReward();

//     await delay(1000);

//     const rewardResponse = await getDailyReward();

//     currentStreak.value = rewardResponse.streak;
//     lastClaimedAt.value = rewardResponse.lastClaimedAt;

//     gameStore.handleRewards(rewardResponse.rewards);
//   } catch (error) {
//     console.error(error);
//   }
// };

const canClaimDailyReward = (index) => {
  // console.log("canClaimDailyReward", canClaimIndexs.value);
  return canClaimIndexs.value.includes(index);
  // if (currentStreak.value === 0 && index === 1) {
  //   return true;
  // }
  // console.log(
  //   "canClaimDailyReward",
  //   index,
  //   currentIndex.value,
  //   canClaimIndexs.value,
  //   index === currentIndex.value && canClaimIndexs.value.includes(index)
  // );

  return canClaimIndexs.value.includes(index);
};

const claimedDailyReward = (index) => {
  return index <= currentIndex.value && !canClaimIndexs.value.includes(index);
};

// const isYesterday = (lastClaimedAt) => {
//   return moment(lastClaimedAt).isSame(moment().subtract(1, "day"), "day");
// };

const getTabClass = (group) => {
  const base = "group-tab";
  const isActive =
    currentGroupParent.value === group ? "active-tab" : "normal-tab";

  return `${base} ${isActive}`;
};

const startDrag = (e) => {
  isDragging = true;
  moved = false;
  startX = e.pageX || e.touches?.[0]?.pageX;
  scrollLeft = dailyContainerRef.value.scrollLeft;
};

const onDrag = (e) => {
  if (!isDragging) return;
  const x = e.pageX || e.touches?.[0]?.pageX;
  const walk = x - startX;
  if (Math.abs(walk) > 5) moved = true;
  dailyContainerRef.value.scrollLeft = scrollLeft - walk;
};

const stopDrag = (e) => {
  isDragging = false;
};
</script>

<template>
  <div
    class="game-content tw-flex-auto tw-overflow-hidden"
    ref="gameContainerRef"
  >
    <div
      class="tw-w-full tw-h-full tw-flex tw-flex-col tw-items-center tw-justify-between tw-px-[4%] tw-py-[5%] tw-bg-cover tw-bg-top tw-bg-no-repeat tw-relative"
    >
      <div ref="tabsWrapperRef" class="tw-w-[90%] tw-h-[13%] tw-flex-none">
        <v-tabs
          v-model="currentGroupParent"
          color="primary"
          grow
          class=""
          height="100%"
        >
          <v-tab
            value="JustFab"
            class="group-tab"
            :class="getTabClass('JustFab')"
            :ripple="false"
            :height="tabsHeight"
          >
            <v-img :src="dailyMission" cover class="tw-w-[20%]" />
          </v-tab>

          <v-tab
            value="Partners"
            class="group-tab"
            :class="getTabClass('Partners')"
            :ripple="false"
            :height="tabsHeight"
          >
            <v-img :src="partnersMission" cover class="tw-w-[20%]" />
          </v-tab>

          <v-tab
            value="Friends"
            class="group-tab"
            :class="getTabClass('Friends')"
            :ripple="false"
            :height="tabsHeight"
          >
            <v-img :src="friendsMission" cover class="tw-w-[20%]" />
          </v-tab>

          <v-tab
            value="Connect"
            :class="getTabClass('Connect')"
            :ripple="false"
            :height="tabsHeight"
          >
            <v-img :src="connectMission" cover class="tw-w-[20%]" />
          </v-tab>
        </v-tabs>
      </div>

      <div class="tw-w-full tw-h-full tw-flex-1 tw-min-h-0 tw-overflow-hidden">
        <v-tabs-window
          v-model="currentGroupParent"
          class="tw-h-full tw-max-h-full [&>.v-window\_\_container]:tw-h-full [&>.v-window\_\_container]:tw-max-h-full"
        >
          <v-tabs-window-item value="JustFab" class="tw-h-full">
            <div class="tw-flex tw-flex-col tw-gap-[1%] tw-h-full">
              <div
                class="tw-text-white tw-px-[1.5%]"
                :style="{
                  fontSize: `${fontSizeBase * 1.5}px`,
                }"
              >
                Daily Rewards
              </div>

              <div
                class="daily-rewards tw-overflow-x-auto tw-flex tw-gap-[2%] tw-relative"
                :style="{
                  height: `${dailyHeight}px`,
                  maxHeight: `${dailyHeight}px`,
                  minHeight: `${dailyHeight}px`,
                }"
                ref="dailyContainerRef"
                @mousedown="startDrag"
                @mousemove="onDrag"
                @mouseup="stopDrag"
                @mouseleave="stopDrag"
                @touchstart="startDrag"
                @touchmove="onDrag"
                @touchend="stopDrag"
              >
                <div
                  v-for="n in 30"
                  class="tw-aspect-[115/212] tw-h-full tw-flex-none tw-relative"
                  :class="{
                    'checked-in': claimedDailyReward(n),
                    'tw-cursor-pointer': canClaimDailyReward(n),
                    'disable-element':
                      !canClaimDailyReward(n) && !claimedDailyReward(n),
                  }"
                  @click="
                    canClaimDailyReward(n)
                      ? handleDailyCheckIn($event, n)
                      : null
                  "
                >
                  <div class="">
                    <v-img :src="dailyReward2">
                      <div class="tw-w-full tw-h-[30%] tw-mt-[10%] tw-relative">
                        <svg
                          viewBox="0 0 50 50"
                          xmlns="http://www.w3.org/2000/svg"
                          class="tw-w-full tw-h-full tw-absolute"
                          ref="dailyRewardRef"
                        >
                          <text
                            v-if="dailyRewardRef && dailyRewardRef[n - 1]"
                            x="50%"
                            y="50%"
                            dominant-baseline="middle"
                            text-anchor="middle"
                            font-family="DynaPuff"
                            :font-size="`${gameStore.setFontSizeBasedOnViewBox(
                              dailyRewardRef[0],
                              40
                            )}px`"
                            font-weight="700"
                            fill="#fff"
                            stroke="#000000"
                            stroke-width="2"
                            paint-order="stroke fill"
                            text-overflow="ellipsis"
                            white-space="nowrap"
                            overflow="hidden"
                            width="100%"
                          >
                            Day {{ n }}
                          </text>
                        </svg>
                      </div>
                    </v-img>
                  </div>

                  <div class="icon-checked-in" v-if="claimedDailyReward(n)">
                    <div class="tw-w-1/2 tw-h-auto tw-aspect-square">
                      <v-img :src="completedDailyReward" cover />
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="tw-text-white tw-px-[1.5%]"
                :style="{
                  fontSize: `${fontSizeBase * 1.5}px`,
                }"
              >
                Just FAB Missions
              </div>

              <div
                class="justfab-tasks tw-flex tw-flex-col tw-gap-[2%] tw-overflow-y-auto task-list tw-grow"
              >
                <task-block
                  v-for="task in justfabMissionTasks"
                  :task="task"
                  :key="task._id"
                  :isCompleted="isCompleted(task._id)"
                  @click="isCompleted(task._id) ? '' : doTask(task)"
                />
              </div>
            </div>
          </v-tabs-window-item>

          <v-tabs-window-item value="Partners" class="tw-h-full">
            <div class="tw-flex tw-flex-col tw-gap-[1%] tw-h-full">
              <div
                class="tw-text-white tw-flex-none tw-px-[1.5%]"
                :style="{
                  fontSize: `${fontSizeBase * 1.5}px`,
                }"
              >
                Our Partners
              </div>

              <div
                class="tw-flex tw-flex-col tw-gap-[2%] tw-overflow-y-auto task-list tw-flex-1 tw-min-h-0 tw-px-[1.5%]"
              >
                <v-expansion-panels
                  flat
                  multiple
                  bg-color="transparent"
                  v-if="allTasks.length"
                >
                  <template
                    v-for="group in partnerChildGroups"
                    :key="group._id"
                  >
                    <v-expansion-panel class="daily-task">
                      <v-expansion-panel-title static class="task-title">
                        <div class="child-element">{{ group.name }}</div>
                      </v-expansion-panel-title>

                      <v-expansion-panel-text class="task-content">
                        <v-list item-props class="task" bg-color="transparent">
                          <v-list-item
                            v-for="task in getTaskByGroup(group._id)"
                            :key="task._id"
                            class="!tw-py-1"
                          >
                            <task-block
                              :task="task"
                              :isCompleted="isCompleted(task._id)"
                              @click="isCompleted(task._id) ? '' : doTask(task)"
                            />
                          </v-list-item>
                        </v-list>
                      </v-expansion-panel-text>
                    </v-expansion-panel>
                  </template>
                </v-expansion-panels>
              </div>
            </div>
          </v-tabs-window-item>

          <v-tabs-window-item value="Friends" class="tw-h-full">
            <div class="tw-flex tw-flex-col tw-gap-[3%] tw-h-full">
              <div
                class="tw-text-white tw-px-[1.5%]"
                :style="{
                  fontSize: `${fontSizeBase * 1.5}px`,
                }"
              >
                Friends
              </div>

              <div class="tw-flex-none tw-px-[1.5%] tw-mb-[4%]">
                <invite-buttons />
              </div>

              <div
                class="tw-flex tw-flex-col tw-gap-[2%] tw-overflow-y-auto task-list tw-flex-1 tw-min-h-0 tw-px-[1%]"
              >
                <referred-list />
                <!-- <referred-users /> -->
              </div>
            </div>
          </v-tabs-window-item>

          <v-tabs-window-item value="Connect" class="tw-h-full">
            <div
              class="tw-flex tw-flex-col tw-items-center tw-w-full tw-h-full"
            >
              <div class="tw-w-[80%] tw-mb-[5%]">
                <v-img :src="aboutFp" cover />
              </div>

              <v-btn color="#FBEBB2" flat class="btn-connect jump-in-anim">
                Connect now
              </v-btn>
            </div>
          </v-tabs-window-item>
        </v-tabs-window>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.icon-checked-in {
  @apply tw-w-[90%] tw-h-[90%] tw-absolute tw-z-[1] tw-left-[5%] tw-top-[6%] tw-bg-black/50 tw-rounded-[0.5em] md:tw-rounded-[1em] tw-flex tw-justify-center tw-items-center;
}

.daily-gift {
  @apply tw-flex tw-justify-center tw-items-center tw-h-full tw-pt-[40%] tw-relative tw-rounded-2xl tw-overflow-hidden;

  &.checked-in {
    &::before {
      content: "";
      @apply tw-absolute tw-top-[30%] tw-bottom-0 tw-w-full tw-bg-[#FF0000]/50 tw-opacity-50 tw-rounded-b-md tw-z-[1];
    }
    .icon-checked-in {
      @apply tw-block;
    }
  }
}

.special-gift {
  @apply tw-flex tw-justify-center tw-items-center tw-h-full tw-relative;
  &.checked-in {
    &::before {
      content: "";
      @apply tw-absolute tw-top-[15.5%] tw-bottom-0 -tw-left-[1.5%] tw-w-full tw-bg-[#FF0000]/50 tw-rounded-b-md tw-z-[1];
    }
    .icon-checked-in {
      @apply tw-block;
    }
  }
}
</style>

<style lang="postcss">
.daily-task {
  @apply !tw-mt-0 tw-mb-[2%];
  .task-title {
    @apply tw-bg-[#FCF0C6] tw-bg-cover tw-bg-center tw-bg-no-repeat tw-aspect-[573/107] tw-w-full tw-h-auto !tw-min-h-0 !tw-py-0;
    font-size: clamp(0.625rem, 2vh, 2.125rem);
    border-radius: 0.5em;
    box-shadow: 0px 12.28px 13.16px -1.75px rgba(0, 0, 0, 0.21);
  }
  .v-expansion-panel-title__icon {
    @apply tw-h-full tw-w-auto tw-aspect-square tw-justify-center tw-items-center;
    i {
      @apply tw-aspect-square tw-h-[55%] tw-w-auto tw-text-[#BE5A25];
    }
  }
  .v-expansion-panel-text__wrapper {
    @apply !tw-p-0;
  }
  .task-content {
    @apply tw-mx-[2%] tw-bg-[#A9A9A9]/60 !tw-border-[0.3vh]  tw-rounded-b-[1em];
    /* border-width: 2%; */
    /* font-size: clamp(0.625rem, 1.5vh, 2.125rem); */
    font-size: var(--base-font-size);
    .task {
      /* @apply tw-divide-y; */
      .v-list-item {
        @apply tw-py-3;
        .v-list-item-title {
          font-size: var(--base-font-size);
        }
        .v-list-item-subtitle {
          @apply tw-line-clamp-none;
          font-size: var(--base-font-size) * 0.6;
          line-height: normal;
        }
      }
    }
  }
}

.task-select {
  @apply tw-bg-contain tw-bg-center tw-bg-no-repeat tw-aspect-[946/114] [&_input]:!tw-border-0 focus:tw-outline-none [&_input]:tw-min-h-0 tw-rounded-md;
  .v-field {
    @apply tw-pr-0;
  }
  .v-select__menu-icon {
    @apply !tw-transform-none tw-text-[230%] tw-text-[#8d2e02] !tw-opacity-100;
  }
  .dropdown-toggle {
    border: none;
    background-color: turquoise;
  }
  .vs__search::placeholder,
  .vs__dropdown-toggle,
  .vs__dropdown-menu {
    background: red;
    border: none;
    color: #394066;
    text-transform: lowercase;
    font-variant: small-caps;
  }
}

.btn-segment {
  @apply tw-min-w-0 tw-bg-cover tw-bg-bottom tw-bg-no-repeat tw-relative tw-rounded-[10%] tw-overflow-hidden !tw-text-white !tw-h-full;
  --dynamic-border: calc(0.02 * var(--container-width));
  border-image: url(/src/assets/images/game/btn-segment.png) 30;
  background: #ff3b4c !important;
  /* height: 57px !important; */
  width: auto;
  border-width: clamp(3px, var(--dynamic-border), 20px);
  padding: 0;
  border-image-outset: 0px;
  border-radius: 10px;
  flex: 1 1 0;
  .v-btn\_\_content {
    font-size: calc(0.8 * var(--base-font-size));
    line-height: calc(0.8 * var(--base-font-size));
    max-width: 100%;
    white-space: pre-wrap;
  }
  &:hover {
    .v-btn\_\_overlay {
      opacity: 0 !important;
    }
  }
}

.tasks-root {
  @apply tw-w-full tw-flex tw-justify-between tw-items-center tw-h-[60%] tw-gap-[2%] tw-max-w-full;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.group-tab {
  @apply !tw-aspect-square tw-min-h-0;
  &.normal-tab {
    .v-btn__content {
      @apply tw-aspect-square tw-w-[80%] tw-h-[80%] tw-max-h-[80%];
    }
  }
  &.active-tab {
    .v-btn__content {
      @apply tw-aspect-square tw-w-full tw-max-h-full;
      height: var(--v-tabs-height);
      width: var(--v-tabs-height);
    }
  }
  .v-btn__overlay,
  .v-tab__slider {
    @apply !tw-opacity-0 !tw-hidden;
  }
}

.daily-rewards,
.task-list {
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none;
  ::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
}

.btn-connect {
  @apply tw-mx-auto tw-bg-cover tw-bg-center tw-bg-no-repeat tw-aspect-[312/108] tw-w-[45%] !tw-h-auto !tw-rounded-[1em] tw-overflow-hidden;
  border: 0.2em solid #996656;
}
</style>
