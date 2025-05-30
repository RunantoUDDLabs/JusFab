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
import { openLink, openTelegramLink } from "@telegram-apps/sdk";
// import { openLink, openPopup, openTelegramLink } from "@telegram-apps/sdk-vue";
import moment from "moment";
import { emitter } from "@plugins/mitt";
import { delay } from "@/utils/helpers";
import { nextTick } from "vue";

definePage({
  meta: {
    layout: "game",
    requiresAuth: true,
    subject: "User",
    action: "read",
  },
});

const gameStore = useGameStore();

const isOpen = ref(false);
const allTasks = ref([]);
const allTaskGroup = ref([]);
const userTasks = ref([]);
const currentGroupParent = ref();
const currentTask = ref();

const currentStreak = ref(0);
// const lastClaimedAt = ref(null);
const streakRewards = ref([]);

let checkTask = null;

const fontSizeBase = computed(() => gameStore.baseFontSize);

const currentIndex = computed(() => {
  if (!currentStreak.value) {
    return;
  }
  return currentStreak.value % 7;
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

  emitter.on("onClaimeDailySuccess", () => getDaily());

  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible") {
      if (currentTask.value && Object.keys(currentTask.value).length) {
        await getSeftTasks();

        currentTask.value = null;
      }
    }
  });
});

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

const getTaskByGroup = (groupId) => {
  return allTasks.value.filter((task) => task.group === groupId);
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
</script>

<template>
  <div class="game-content tw-flex-auto tw-overflow-hidden">
    <div class="tw-flex tw-flex-col tw-h-full">
      <!-- <div class="-tw-mt-[2.4%]"> -->
      <div class="tw-aspect-[687/136] tw-w-[63.6%] tw-mx-auto">
        <v-img :src="dailyReward" />
      </div>
      <!-- </div> -->

      <div
        class="rewards-container tw-w-full tw-aspect-[1080/580] tw-bg-cover tw-bg-center tw-bg-no-repeat tw-grid tw-grid-cols-7 tw-grid-rows-2 tw-pl-[8.5%] tw-pr-[9.2%] tw-py-[2.5%] tw-gap-x-[4%] tw-gap-y-[8%] slide-in-elliptic-top-fwd"
        :style="{ backgroundImage: `url(${bgGifts})` }"
      >
        <div
          class="tw-col-span-5 tw-row-span-1 tw-grid tw-grid-cols-3 tw-grid-rows-1 tw-gap-[5%]"
        >
          <div
            class="daily-gift"
            :class="{
              'checked-in': claimedDailyReward(1),
              'tw-cursor-pointer': canClaimDailyReward(1),
              'disable-element':
                !canClaimDailyReward(1) && !claimedDailyReward(1),
            }"
            @click="
              canClaimDailyReward(1) ? handleDailyCheckIn($event, 1) : null
            "
          >
            <div class="tw-aspect-[99/102] tw-w-1/2">
              <v-img :src="gift1" />
            </div>

            <div class="icon-checked-in">
              <v-img :src="iconCheckedIn" />
            </div>
          </div>

          <div
            class="daily-gift"
            :class="{
              'checked-in': claimedDailyReward(2),
              'tw-cursor-pointer': canClaimDailyReward(2),
              'disable-element':
                !canClaimDailyReward(2) && !claimedDailyReward(2),
            }"
            @click="
              canClaimDailyReward(2) ? handleDailyCheckIn($event, 2) : null
            "
          >
            <div class="tw-aspect-[99/102] tw-w-1/2">
              <v-img :src="gift2" />
            </div>

            <div class="icon-checked-in">
              <v-img :src="iconCheckedIn" />
            </div>
          </div>

          <div
            class="daily-gift"
            :class="{
              'checked-in': claimedDailyReward(3),
              'tw-cursor-pointer': canClaimDailyReward(3),
              'disable-element':
                !canClaimDailyReward(3) && !claimedDailyReward(3),
            }"
            @click="
              canClaimDailyReward(3) ? handleDailyCheckIn($event, 3) : null
            "
          >
            <div class="tw-aspect-[99/102] tw-w-1/2">
              <v-img :src="gift3" />
            </div>

            <div class="icon-checked-in">
              <v-img :src="iconCheckedIn" />
            </div>
          </div>
        </div>

        <div class="reward tw-row-span-2 tw-col-span-2">
          <div
            class="special-gift"
            :class="{
              'checked-in': claimedDailyReward(7),
              'tw-cursor-pointer': canClaimDailyReward(7),
              'disable-element':
                !canClaimDailyReward(7) && !claimedDailyReward(7),
            }"
            @click="
              canClaimDailyReward(7) ? handleDailyCheckIn($event, 7) : null
            "
          >
            <div class="tw-aspect-[169/176] tw-w-3/4">
              <v-img :src="gift7" />
            </div>

            <div class="icon-checked-in">
              <v-img :src="iconCheckedIn" />
            </div>
          </div>
        </div>

        <div
          class="tw-col-span-5 tw-row-span-1 tw-grid tw-grid-cols-3 tw-grid-rows-1 tw-gap-[5%]"
        >
          <div
            class="daily-gift"
            :class="{
              'checked-in': claimedDailyReward(4),
              'tw-cursor-pointer': canClaimDailyReward(4),
              'disable-element':
                !canClaimDailyReward(4) && !claimedDailyReward(4),
            }"
            @click="
              canClaimDailyReward(4) ? handleDailyCheckIn($event, 4) : null
            "
          >
            <div class="tw-aspect-[99/102] tw-w-1/2">
              <v-img :src="gift4" />
            </div>

            <div class="icon-checked-in">
              <v-img :src="iconCheckedIn" />
            </div>
          </div>

          <div
            class="daily-gift"
            :class="{
              'checked-in': claimedDailyReward(5),
              'tw-cursor-pointer': canClaimDailyReward(5),
              'disable-element':
                !canClaimDailyReward(5) && !claimedDailyReward(5),
            }"
            @click="
              canClaimDailyReward(5) ? handleDailyCheckIn($event, 5) : null
            "
          >
            <div class="tw-aspect-[99/102] tw-w-1/2">
              <v-img :src="gift5" />
            </div>

            <div class="icon-checked-in">
              <v-img :src="iconCheckedIn" />
            </div>
          </div>

          <div
            class="daily-gift"
            :class="{
              'checked-in': claimedDailyReward(6),
              'tw-cursor-pointer': canClaimDailyReward(6),
              'disable-element':
                !canClaimDailyReward(6) && !claimedDailyReward(6),
            }"
            @click="
              canClaimDailyReward(6) ? handleDailyCheckIn($event, 6) : null
            "
          >
            <div class="tw-aspect-[99/102] tw-w-1/2">
              <v-img :src="gift6" />
            </div>

            <div class="icon-checked-in">
              <v-img :src="iconCheckedIn" />
            </div>
          </div>
        </div>
      </div>

      <div
        class="tw-flex-auto tw-flex tw-flex-col tw-overflow-hidden tw-bg-[#c26828] tw-bg-[100%_auto] tw-bg-top tw-bg-no-repeat"
        :style="{ backgroundImage: `url(${bgBoxTask})` }"
      >
        <div
          class="tw-w-full tw-flex-col tw-aspect-[1080/157] tw-flex tw-justify-center tw-items-center tw-px-[8%]"
        >
          <!-- <div class="tw-px-[8%] tw-w-full tw-h-full"> -->
          <!-- <div
            class="tw-w-full tw-h-full tw-flex tw-justify-between tw-items-center"
          > -->
          <v-item-group
            class="tasks-root"
            selected-class="heartbeat-infinite"
            v-model="currentGroupParent"
            mandatory
          >
            <v-item
              v-slot="{ isSelected, selectedClass, toggle }"
              v-for="group in groupsParent"
              :key="group._id"
              :value="group._id"
            >
              <v-btn
                color="transparent"
                flat
                :ripple="false"
                class="btn-segment"
                :class="selectedClass"
                @click="toggle"
              >
                <div>
                  {{ group.name }}
                </div>
              </v-btn>
            </v-item>
          </v-item-group>
          <!-- <v-btn
                color="transparent"
                flat
                class="tw-aspect-[220/97] tw-w-[24.2%] !tw-h-auto tw-min-w-0 tw-bg-cover tw-bg-bottom tw-bg-no-repeat tw-relative tw-rounded-[10%] tw-overflow-hidden disable-element"
                :style="{
                  backgroundImage: `url(${btnFab})`,
                }"
                @click="submitFab($event)"
              ></v-btn> -->
          <!-- <v-btn
                color="transparent"
                flat
                class="tw-aspect-[220/97] tw-w-[24.2%] !tw-h-auto tw-min-w-0 tw-bg-cover tw-bg-bottom tw-bg-no-repeat tw-relative tw-rounded-[10%] tw-overflow-hidden disable-element"
                :style="{
                  backgroundImage: `url(${btnFab})`,
                }"
                @click="submitFab($event)"
              ></v-btn>

              <v-btn
                color="transparent"
                flat
                class="tw-aspect-[318/97] tw-w-[35.1%] !tw-h-auto tw-min-w-0 tw-bg-cover tw-bg-bottom tw-bg-no-repeat tw-relative tw-rounded-[10%] tw-overflow-hidden disable-element"
                :style="{ backgroundImage: `url(${btnNetwork})` }"
                @click="submitNetwork"
              ></v-btn>

              <v-btn
                color="transparent"
                flat
                class="tw-aspect-[220/97] tw-w-[24.2%] !tw-h-auto tw-min-w-0 tw-bg-cover tw-bg-bottom tw-bg-no-repeat tw-relative tw-rounded-[10%] tw-overflow-hidden disable-element"
                :style="{ backgroundImage: `url(${btnFriend})` }"
                @click="submitFriend"
              ></v-btn> -->
          <!-- </div> -->
          <!-- </div> -->
        </div>

        <div
          class="tw-h-auto tw-max-h-full tw-overflow-y-scroll tw-px-[7%] tw-py-[5%] tw-flex tw-flex-col tw-gap-[1vh]"
        >
          <v-expansion-panels
            flat
            hide-actions
            multiple
            bg-color="transparent"
            v-if="allTasks.length"
          >
            <template v-for="group in currentGroups" :key="group._id">
              <v-expansion-panel class="daily-task">
                <v-expansion-panel-title
                  static
                  collapse-icon="material-symbols-arrow-drop-down"
                  expand-icon="material-symbols-arrow-right"
                  class="task-title"
                  :style="{ backgroundImage: `url(${inputDailyTask})` }"
                >
                  <div class="child-element">{{ group.name }}</div>
                </v-expansion-panel-title>

                <v-expansion-panel-text class="task-content">
                  <v-list item-props class="task" bg-color="transparent">
                    <v-list-item
                      v-for="task in getTaskByGroup(group._id)"
                      :key="task._id"
                      :title="task.title"
                      :subtitle="task.description || ''"
                      @click="isCompleted(task._id) ? '' : doTask(task)"
                      :style="{
                        fontSize: `${fontSizeBase}px !important`,
                        '--base-font-size': `${fontSizeBase}px`,
                      }"
                    >
                      <div
                        :style="{
                          fontSize: `${fontSizeBase * 0.8}px !important`,
                        }"
                      >
                        Reward: {{ task.reward.value }} {{ task.reward.type }}
                      </div>
                      <template #append>
                        <v-img
                          :src="iconCheckedIn"
                          v-if="isCompleted(task._id)"
                          width="12"
                        />
                      </template>
                    </v-list-item>
                  </v-list>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </template>
          </v-expansion-panels>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.icon-checked-in {
  @apply tw-aspect-[77/82] tw-w-1/2 tw-absolute tw-hidden tw-z-[1];
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
    @apply tw-bg-transparent tw-bg-cover tw-bg-center tw-bg-no-repeat tw-aspect-[946/114] tw-w-full tw-h-auto !tw-min-h-0 !tw-py-0 !tw-pl-[2%] !tw-pr-0;
    font-size: clamp(0.625rem, 2vh, 2.125rem);
  }
  .v-expansion-panel-title__icon {
    @apply tw-h-full tw-w-auto tw-aspect-square tw-justify-center tw-items-center;
    i {
      @apply tw-aspect-square tw-h-[85%] tw-w-auto tw-text-[#8d2e02];
    }
  }
  .task-content {
    @apply tw-mx-[2%] tw-bg-[#FFF0C3]/60 !tw-border-[0.3vh] !tw-border-t-0 tw-border-solid tw-border-[#8D2E02] tw-rounded-b-[1em];
    /* border-width: 2%; */
    /* font-size: clamp(0.625rem, 1.5vh, 2.125rem); */
    font-size: var(--base-font-size);
    .task {
      @apply tw-divide-y;
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
</style>
