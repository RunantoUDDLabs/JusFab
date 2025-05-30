import { $apiAuth } from "@/plugins/axios";
import { cookies } from "@/plugins/useCookies";
import { store } from "@store";
import { $ability } from "@/plugins/casl";
import { getApiPath } from "@/utils/helpers";

const authStore = useAuthStore(store);

const API = {
  user: {
    auth: "/user/auth",
    refreshToken: "/user/refreshToken",
  },
};

export const refreshToken = async () => {
  try {
    const res = await $apiAuth.post(API.user.refreshToken);
    const expiresIn = import.meta.env.VITE_JWT_LIFETIME || "24h";

    const expirationTime = Date.now() + parseJwtLifetime(expiresIn);
    authStore.setToken(res.data.token, expirationTime);

    return res.data;
  } catch (error) {
    // authStore.token = null;
    // $ability.update("GUEST");
    // cookies.remove("token");
    // authStore.setToken(null);
    // cookies.remove("role");
    console.log(error);

    throw error;
  }
};

export const authTelegram = async (payload) => {
  try {
    const res = await $apiAuth.post(
      API.user.auth,
      {
        initData: payload,
      },
      {
        useAuthToken: false,
      }
    );

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};
