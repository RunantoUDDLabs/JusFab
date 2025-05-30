<script setup>
import bgLoadingGame from "@images/game/bg-loading-game.png";
import { retrieveLaunchParams } from "@telegram-apps/sdk";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const gameStore = useGameStore();
const authStore = useAuthStore();

definePage({
  meta: {
    layout: "blank",
    public: true,
    unauthenticated: true,
  },
});

onBeforeMount(() => {
  gameStore.setLoading(true);
});

onUnmounted(() => {
  gameStore.setLoading(false);
});

onMounted(async () => {
  let hashes = window.location.hash
    .substring(1)
    .split("&")
    .reduce((acc, curr) => {
      const [key, value] = curr.split("=");
      acc[key] = value;
      return acc;
    }, {});
  try {
    const initData = decodeURIComponent(hashes.tgWebAppData);

    const data = await authTelegram(initData);

    if (data.token) {
      const expiresIn = import.meta.env.VITE_JWT_LIFETIME || "24h";
      const expirationTime = Date.now() + parseJwtLifetime(expiresIn);
      authStore.setToken(data.token, expirationTime);
      await fetchData();
    }
  } catch (e) {
    console.log(e);
  }

  return;
});

const fetchData = async () => {
  try {
    await getUserInfo();

    if (userStore.userData && Object.keys(userStore.userData).length) {
      router.push("/game/jackpot");
    }
  } catch (error) {
    console.error(error);

    userStore.userData = null;
    authStore.setToken(null);

    router.push("/");
  }
};
</script>

<template>
  <div
    class="tw-bg-[#86C7E5] tw-w-screen tw-h-screen tw-flex tw-items-center tw-justify-center"
  >
    <div
      class="game-container tw-w-auto tw-h-[1920px] tw-aspect-[9/16] tw-max-w-full tw-max-h-full tw-bg-[#D9D9D9] tw-bg-cover tw-bg-center tw-bg-no-repeat tw-flex tw-flex-col tw-relative"
      :style="{ backgroundImage: `url(${bgLoadingGame})` }"
    >
      <div
        class="game-content tw-flex-grow tw-flex tw-justify-center tw-items-center tw-text-white"
      >
        Redirect user...
      </div>
    </div>
  </div>
</template>
