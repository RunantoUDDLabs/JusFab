import { $apiGame } from "@/plugins/axios";
import { store } from "@store";
import { useGtag } from "vue-gtag-next";

const userStore = useUserStore(store);
const gtag = useGtag();

const API = {
  inventory: {
    user: "/inventory/:userId",
    add: "/inventory/:userId/add",
    remove: "/inventory/:userId/remove",
  },
  slotMachine: {
    get: "/slotMachine",
    set: "/slotMachine",
    play: "/slotMachine/play",
  },
  jackpot: {
    get: "/jackpot",
    set: "/jackpot",
    getRewards: "/jackpot/rewards",
  },
  user: {
    claimEnergy: "/user/claimEnergy",
  },
  reward: {
    claim: "/reward/claim",
    claimAll: "/reward/claim/all",
    getUnclaimed: "/reward/unclaimed",
    daily: "/reward/daily",
    claimDaily: "/reward/daily/claim",
  },
};

export const getUserInventory = async (userId) => {
  try {
    const url = getApiPath(API.inventory.user, { userId: userId });
    const res = await $apiGame.get(url);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const addItemToInventory = async (userId, payload) => {
  try {
    const url = getApiPath(API.inventory.add, { userId: userId });
    const res = await $apiGame.post(url, payload);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const removeItemFromInventory = async (userId, payload) => {
  try {
    const url = getApiPath(API.inventory.remove, { userId: userId });
    const res = await $apiGame.post(url, payload);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const getSlotMachineConfig = async () => {
  try {
    const url = getApiPath(API.slotMachine.get);
    const res = await $apiGame.get(url);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const setSlotMachineConfig = async (payload) => {
  try {
    const url = getApiPath(API.slotMachine.set);
    const res = await $apiGame.post(url, payload);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const playSlotMachine = async ({ betX = 1 }) => {
  try {
    const url = getApiPath(API.slotMachine.play);
    const res = await $apiGame.post(url, betX);

    // Set user ID (optional)
    gtag.set({ user_id: userStore.userData._id });

    gtag.event('play_slot', {
      betX: betX
    });

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const claimEnergy = async () => {
  try {
    const url = getApiPath(API.user.claimEnergy);
    const res = await $apiGame.post(url);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const getJackpot = async () => {
  try {
    const url = getApiPath(API.jackpot.get);
    const res = await $apiGame.get(url);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const setJackpot = async (payload) => {
  try {
    const url = getApiPath(API.jackpot.set);
    const res = await $apiGame.post(url, payload);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const getJackpotRewards = async () => {
  try {
    const url = getApiPath(API.jackpot.getRewards);
    const res = await $apiGame.get(url);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const claimReward = async (rewardId) => {
  try {
    const res = await $apiGame.post(API.reward.claim, { rewardId });

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const claimAllRewards = async () => {
  try {
    const url = getApiPath(API.reward.claimAll);
    const res = await $apiGame.post(url);

    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const getUnclaimedRewards = async () => {
  try {
    const url = getApiPath(API.reward.getUnclaimed);
    const res = await $apiGame.get(url);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const getDailyReward = async () => {
  try {
    const res = await $apiGame.get(API.reward.daily);

    // Set user ID (optional)
    gtag.set({ user_id: res.data._id });

    // Set user properties
    gtag.set({
      user_properties: {
        daily_streak: res.data.record.streak,
      }
    });

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const claimDailyReward = async () => {
  try {
    const res = await $apiGame.post(API.reward.claimDaily);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};
