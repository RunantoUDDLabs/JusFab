<script setup>
import bgLoadingGame from "@images/game/bg-loading-game.png";

definePage({
  meta: {
    layout: "blank",
    public: true,
    unauthenticated: true,
  },
});

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
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

    await nextTick();

    if (userStore.userData && userStore.userData.role === ROLES.ADMIN) {
      router.push("/dashboard");
    }
  } catch (error) {
    console.error(error);

    // appStore.showNotiSnackbar({
    //   color: "error",
    //   message:
    //     error.message || t("Error occurred. Please contact the administrator."),
    // });

    userStore.userData = null;
    authStore.setToken(null);

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
        Redirect Admin...
      </div>
    </div>
  </div>
</template>
