import { defineStore } from "pinia";
import { useUserStore } from "./user";
import { emitter } from "@plugins/mitt";

export const useGameStore = defineStore("game", () => {
  const userStore = useUserStore();

  const isLoading = ref(false);
  const isWelcome = ref(false);
  const baseFontSize = ref(16);
  const gameContainer = ref(null);
  const parentWidth = ref(0);

  const resultItemDialogRef = ref(null);
  const arrayResultItemDialogRef = ref([]);
  const statsKapy = ref(null);
  const equippedKapy = ref(null);

  const combatPower = computed(() =>
    formatNumber(
      statsKapy.value?.hp * 0.5 +
        statsKapy.value?.attack * 1.5 +
        statsKapy.value?.defense * 2
    )
  );

  const setLoading = (value) => {
    isLoading.value = value;
  };

  const setWelcome = (value) => {
    isWelcome.value = value;
  };

  const setResponsiveFont = (parent = gameContainer.value, scale = 0.03) => {
    if (!parent) return;
    parentWidth.value = parent.offsetWidth;

    const calculatedFontSize = parentWidth.value * scale;

    return Math.min(36, Math.max(10, calculatedFontSize));
  };

  const setResponsiveFontPercentage = (parent, percent) => {
    if (!parent) return;
    parentWidth.value = parent.offsetWidth;

    return parentWidth.value * (percent / 100);
  };

  const setFontSizeBasedOnViewBox = (svgElement, percent) => {
    if (!svgElement) return;
    const viewBox = svgElement.getAttribute("viewBox").split(" ");
    const viewBoxHeight = parseFloat(viewBox[3]);

    return viewBoxHeight * (percent / 100);
  };

  const handleRewards = (rewards, rewardsType = "slot-machine") => {
    for (const reward of rewards) {
      switch (reward.type) {
        case REWARD_TYPES.JACKPOT:
        case REWARD_TYPES.FOOD:
        case REWARD_TYPES.SPIN:
          break;
        case REWARD_TYPES.TOKEN:
          // userStore.userData.token += reward.value;
          if (rewardsType === "slot-machine") {
            userStore.userData.token += reward.value;
          } else if (rewardsType === "no-claim") {
            openResultDialog(reward, rewardsType);
          } else {
            openResultDialog(reward, rewardsType);
          }
          break;
        case REWARD_TYPES.GOLD:
          // userStore.userData.gold += reward.value;
          if (rewardsType === "slot-machine") {
            userStore.userData.gold += reward.value;
          } else if (rewardsType === "no-claim") {
            console.log("no-claim", reward, rewardsType);
            openResultDialog(reward, rewardsType);
          } else {
            openResultDialog(reward, rewardsType);
          }
          break;
        case REWARD_TYPES.ITEM:
        case REWARD_TYPES.ENERGY:
        case REWARD_TYPES.POOL_PERCENTAGE:
          openResultDialog(reward, rewardsType);
          break;
        default:
          console.warn(`Unknown reward type: ${reward.type}`);
          break;
      }
    }
  };

  const openResultDialog = (item, rewardsType = "slot-machine") => {
    arrayResultItemDialogRef.value.push({
      id: item._id,
      item,
      open: true,
      rewardsType,
    });
  };

  const closeDialog = (id) => {
    arrayResultItemDialogRef.value = arrayResultItemDialogRef.value.filter(
      (dialog) => dialog.id !== id
    );
  };

  const getKapyDetails = async () => {
    try {
      const { stats, equipments } = await getKapy();

      if (stats) {
        statsKapy.value = stats;
      }

      if (equipments) {
        equippedKapy.value = equipments;
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {
    isLoading,
    baseFontSize,
    gameContainer,
    parentWidth,
    resultItemDialogRef,
    arrayResultItemDialogRef,
    statsKapy,
    equippedKapy,
    combatPower,
    isWelcome,
    setLoading,
    setResponsiveFont,
    setResponsiveFontPercentage,
    setFontSizeBasedOnViewBox,
    handleRewards,
    openResultDialog,
    closeDialog,
    getKapyDetails,
    setWelcome,
  };
});
