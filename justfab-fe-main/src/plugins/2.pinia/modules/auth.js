import { cookies } from "@/plugins/useCookies";
import { defineStore } from "pinia";
import { useUserStore } from "./user";

export const useAuthStore = defineStore("auth", () => {
  const userStore = useUserStore();
  const token = useLocalStorage("token", null);
  const jwtExpiration = useLocalStorage("jwt_expiration", null);

  // const token = computed({
  //   get: () => cookies.get("token") || null,
  //   set: (val) =>
  //     cookies.set("token", val, { path: "/", maxAge: 60 * 60 * 24 }), // 24 hours
  // });

  const isLoggedIn = computed(
    () =>
      !!(
        cookies.get("user_role") &&
        Object.keys(userStore.userData)?.length &&
        token.value
      )
  );

  const setToken = (newToken, expiration = null) => {
    token.value = newToken;
    jwtExpiration.value = expiration || null;
  };

  return {
    token,
    jwtExpiration,
    isLoggedIn,
    setToken,
  };
});
