<script setup>
import { claimEnergy } from "@/api/game";
import ResultItemDialog from "@/components/Dialog/ResultItemDialog.vue";
import gameBg from "@images/game/bg-game-1.png";
import { emitter } from "@plugins/mitt";

definePage({
  meta: {
    layout: "game",
    requiresAuth: true,
    subject: "User",
    action: "read",
  },
});

const route = useRoute();
const userStore = useUserStore();
const gameStore = useGameStore();

const refSlotMachine = ref();

const jackpot = ref(100000);
const jackpotRewards = ref([]);
const enable = ref(true);
const gameContentRef = ref(null);
const parentDivWidth = ref(0);
const currentRewards = ref(null);
const itemReward = ref(null);
const resultItemDialogRef = ref(null);
const sfxVolume = useLocalStorage("sfxVolume", 50);

let resizeObserver;

const energy = computed(() => userStore.userData?.energy || 0);
const claimEnergyAt = computed(
  () => new Date(userStore.userData?.claimEnergyAt)
);
const bottomValue = computed(() => {
  return `${parentDivWidth.value / (1080 / 170)}px`;
});

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

  try {
    const p1 = getUserInfo();
    const p2 = getJackpotRewards().then(({ rewards, pool }) => {
      jackpotRewards.value = rewards;
      jackpot.value = pool;
    });

    await Promise.all([p1, p2]);
  } catch (error) {
    console.log("error", error);
  }

  emitter.on("reset-rewards-state", resetRewardsState);
});

const onResizeWindow = () => {
  if (gameContentRef.value) {
    observe(gameContentRef.value, handleResize);
  }
};

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResizeWindow);
});

onUnmounted(() => {
  emitter.off("reset-rewards-state");
});

const onRollClick = async (betX) => {
  if (!enable.value) return;
  try {
    enable.value = false;

    const { playScripts, rewards, user } = await playSlotMachine({ betX });

    userStore.userData.energy = user.energy;
    currentRewards.value = rewards;

    await refSlotMachine.value?.roll(playScripts);
  } catch (error) {
    enable.value = true;
    console.log("error", error);
  } finally {
  }
};

const onScriptCompleted = async (script) => {
  await processRewards(script.rewards, script.reelSymbols);
};

const onAllScriptCompleted = () => {
  enable.value = true;
};

const resetRewardsState = () => {
  itemReward.value = null;
  currentRewards.value = null;
};

const processRewards = async (rewards, reelSymbols = []) => {
  let reelSymbolsStr = reelSymbols.sort().join("");
  let GIFEffectId = -1;
  console.log(reelSymbolsStr)
  if(reelSymbolsStr.includes("XXX") || reelSymbolsStr.includes("OO")) {
    GIFEffectId = 0;
  }

  if(reelSymbolsStr.includes("XXXX")) {
    GIFEffectId = 1;
  }

  if(reelSymbolsStr.includes("OOO") || reelSymbolsStr.includes("JJ")) {
    GIFEffectId = 2;
  }

  if(reelSymbolsStr.includes("OOOO")) {
    GIFEffectId = 3;
  }

  if(reelSymbolsStr.includes("JJJ")) {
    GIFEffectId = 4;
  }

  if(reelSymbolsStr.includes("JJJJ")) {
    GIFEffectId = 5;
  }

  if(GIFEffectId > -1) {
    await refSlotMachine.value.showGIFEffect(GIFEffectId);
  }

  let hasRewardEffect = false;
  for (const r of rewards) {
    if (r.type == "GOLD") {
      refSlotMachine.value.showGoldEffect();
      refSlotMachine.value.showValue(`+${r.value}`);
      hasRewardEffect = true;
    }
    if (r.type == "FOOD") {
      refSlotMachine.value.showFoodEffect();
      refSlotMachine.value.showValue(`+${r.value}`);
      hasRewardEffect = true;
    }
    if (r.type == "TOKEN") {
      refSlotMachine.value.showTokenEffect();
      refSlotMachine.value.showValue(`+${r.value}`);
      hasRewardEffect = true;
    }
    if (r.type == "SPIN") {
      hasRewardEffect = true;
    }
  }

  if (hasRewardEffect) {
    await refSlotMachine.value.waitForSeconds(1.5);
  }

  gameStore.handleRewards(rewards, "slot-machine");
  await refSlotMachine.value.rollNextStep();
  return true;
};

onBeforeUnmount(() => {});

const onClaimEnergyClick = async (e) => {
  try {
    let oldEnergy = userStore.userData.energy;

    const { energy: newEnergy, lastClaimed: newClaimEnergyAt } =
      await claimEnergy();

    userStore.userData.claimEnergyAt = newClaimEnergyAt;
    userStore.userData.energy = newEnergy;
  } catch (error) {
    console.log("error", error);
  }
};
</script>

<template>
  <div ref="gameContentRef" class="game-content tw-flex-grow">
    <div
      class="tw-absolute tw-top-0 tw-left-0 tw-right-0"
      :style="{ bottom: bottomValue }"
    >
      <!-- <keep-alive> -->
      <slot-machine
        ref="refSlotMachine"
        :energy="energy"
        :jackpot="jackpot"
        :disabled="!enable"
        :jackpotRewards="jackpotRewards"
        :claimEnergyAt="claimEnergyAt"
        :volume="sfxVolume"
        @rollClick="onRollClick"
        @scriptCompleted="onScriptCompleted"
        @allScriptCompleted="onAllScriptCompleted"
        @claimEnergyClick="onClaimEnergyClick"
      ></slot-machine>
      <!-- </keep-alive> -->
    </div>
  </div>
</template>
