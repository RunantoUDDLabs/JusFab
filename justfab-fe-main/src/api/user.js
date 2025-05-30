import { $apiGame } from "@/plugins/axios";
import { cookies } from "@/plugins/useCookies";
import { store } from "@store";
import { updateAbility } from "@plugins/casl/casl";
import { $ability } from "@/plugins/casl";
import { useGtag } from "vue-gtag-next";

const authStore = useAuthStore(store);
const userStore = useUserStore(store);
const gtag = useGtag();

const API = {
  user: {
    info: "/user/info",
  },
  referral: {
    refLink: "/referral/link",
    recruited: "/referral/count",
  },
  task: {
    seft: "/task/userTasks",
  },
  kapy: {
    equip: "/kapy/setEquipments",
    get: "/kapy",
  },
};

export const getUserInfo = async () => {
  try {
    const res = await $apiGame.get(API.user.info);

    if (res.status === 200 && res.data) {
      userStore.userData = res.data;

      // await updateAbility(res.data.role || "GUEST");

      // console.log("updateAbility done", $ability);

      $ability.update(USER_ABILITY_RULES[res.data.role] || "GUEST");

      gtag.event('login', {
        user_id: res.data._id
      });

      // Set user ID (optional)
      gtag.set({ user_id: res.data._id });

      // Set user properties
      gtag.set({
        user_properties: {
          telegram_id: res.data.telegram.id,
          telegram_username: res.data.telegram.username,
          gold: res.data.gold,
          token: res.data.token,
          slot_plays: res.data.slotMachinePlayed,
        }
      });
    }

    return res.data;
  } catch (error) {
    // userStore.userData = null;

    console.log(error);
    throw error.response?.data || error;
  }
};

export const getReferralLink = async () => {
  try {
    const res = await $apiGame.get(API.referral.refLink);

    if (res.status === 200 && res.data) {
      userStore.setRefLink(res.data.referralLink);
    }

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data || error;
  }
};

export const getRecruitedUsers = async () => {
  try {
    const res = await $apiGame.get(API.referral.recruited);

          // Set user ID (optional)
    gtag.set({ user_id: userStore.userData._id });

    // Set user properties
    gtag.set({
      user_properties: {
        referral_count: res.data.count,
      }
    });

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data || error;
  }
};

export const getUserTasks = async () => {
  try {
    const res = await $apiGame.get(API.task.seft);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data || error;
  }
};

export const setEquipments = async (data) => {
  try {
    const res = await $apiGame.post(API.kapy.equip, {
      equipmentIds: data,
    });

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data || error;
  }
};

export const getKapy = async () => {
  try {
    const res = await $apiGame.get(API.kapy.get);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data || error;
  }
};
