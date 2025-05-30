<script setup>
import gameBg from "@images/game/bg-game-1.png";
import { cookies } from "@/plugins/useCookies";
import { fetchFPToken } from "@/api/fp";
import { parseJwt } from "@/utils/helpers";
import { nextTick } from "vue";

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

onMounted(async () => {
  localStorage.setItem("fp_code", route.query.code);
  if (route.query.code) {
    try {
      await nextTick();
      await fetchToken();
    } catch (e) {}
  }
  router.push("/game/connect-wallet");
});

const fetchToken = async () => {
  try {
    const data = await fetchFPToken();
    console.log(data);
    localStorage.setItem("fp_access_token", data.access_token);
    localStorage.setItem("fp_id_token", data.id_token);
    localStorage.setItem("fp_refresh_token", data.refresh_token);

    const { header, payload, signature } = parseJwt(data.id_token);
    console.log(payload);
    localStorage.setItem("fp_futurepass", payload.futurepass);
    localStorage.setItem("fp_custodian", payload.custodian);
    localStorage.setItem("fp_email", payload.email);
    localStorage.setItem("fp_chainId", payload.chainId);
  } catch (error) {
    console.error(error);
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
      :style="{ backgroundImage: `url(${gameBg})` }"
    >
      <div
        class="game-content tw-flex-grow tw-flex tw-justify-center tw-items-center"
      >
        Loading Dev...
      </div>
    </div>
  </div>
</template>
