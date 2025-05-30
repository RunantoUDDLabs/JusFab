<script setup>
import bgLoadingGame from "@images/game/bg-loading-game.png";
import { cookies } from "@/plugins/useCookies";

definePage({
  meta: {
    layout: "blank",
    public: true,
    unauthenticated: true,
  },
});

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const gameStore = useGameStore();

onBeforeMount(() => {
  gameStore.setLoading(true);
});

onUnmounted(() => {
  gameStore.setLoading(false);
});

onMounted(async () => {
  if (route.params.token) {
    const expiresIn = import.meta.env.VITE_JWT_LIFETIME || "24h";
    const expirationTime = Date.now() + parseJwtLifetime(expiresIn);
    authStore.setToken(route.params.token, expirationTime);

    await fetchData();
  } else {
    router.push("/");
  }
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
    userStore.token = null;

    router.push("/");
  }
};

// watch(
//   () => [route.params.token, authStore.token],
//   async (token) => {
//     if (token) {
//       await fetchData();
//     }
//   }
// );
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
