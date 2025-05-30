<script setup>
definePage({
  meta: {
    layout: "game",
    requiresAuth: true,
    subject: "User",
    action: "read",
  },
});
let resizeObserver;

const settingDialogRef = ref(null);
const gameContentRef = ref(null);
const parentDivWidth = ref(0);

const { observe } = useMixin();

const handleResize = (newWidth) => {
  parentDivWidth.value = newWidth;
};

onMounted(() => {
  nextTick(() => {
    if (gameContentRef.value) {
      observe(gameContentRef.value, handleResize);
    }
    window.addEventListener("resize", onResizeWindow);
  });

  // if (gameContentRef.value) {
  //   resizeObserver = new ResizeObserver((entries) => {
  //     for (let entry of entries) {
  //       parentDivWidth.value = entry.contentRect.width;
  //     }
  //   });

  //   resizeObserver.observe(gameContentRef.value);
  // }
});

const onResizeWindow = () => {
  if (gameContentRef.value) {
    observe(gameContentRef.value, handleResize);
  }
};

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResizeWindow);
});

onUnmounted(() => {});

const submitOpenSettingDialog = () => {
  settingDialogRef.value.openDialog();
};
</script>

<template>
  <div
    class="game-content tw-flex-auto tw-flex tw-items-center tw-justify-center"
    ref="gameContentRef"
  >
    <div
      class="tw-aspect-[936/759] tw-w-[80%] tw-grid tw-grid-cols-3 tw-grid-rows-4 tw-gap-[6%]"
    >
      <div class="menu tw-col-span-1 tw-row-span-2">
        <router-link class="menu-link" :to="{ path: '/game/referral' }">
          {{ $t("Invite to Fab") }}
        </router-link>
      </div>

      <div
        class="menu tw-col-span-1 tw-row-span-2"
        :to="{ path: '/game/connect-wallet' }"
      >
        <router-link class="menu-link" :to="{ path: '/game/connect-wallet' }">
          {{ $t("Connect Futurepass") }}
        </router-link>
      </div>

      <div class="menu tw-col-span-1 tw-row-span-2 disable-element">
        <span class="menu-link">
          {{ $t("???") }}
        </span>
      </div>

      <div class="menu tw-col-span-1 tw-row-span-2 disable-element">
        <span class="menu-link">
          {{ $t("???") }}
        </span>
      </div>

      <div class="menu tw-col-span-2 tw-row-span-1 disable-element">
        <span class="menu-link">
          {{ $t("???") }}
        </span>
      </div>

      <div class="menu tw-col-span-1 tw-row-span-1 disable-element">
        <span class="menu-link">
          {{ $t("???") }}
        </span>
      </div>

      <div class="menu tw-col-span-1 tw-row-span-1">
        <div class="menu-link" @click="submitOpenSettingDialog">
          {{ $t("Settings") }}
        </div>
      </div>
    </div>

    <setting-dialog ref="settingDialogRef" :width="parentDivWidth * 0.9" />
  </div>
</template>

<style lang="postcss" scoped>
.menu {
  @apply tw-bg-[#FFEFBF] tw-border-solid tw-border-[#953B0E]  tw-font-semibold tw-text-center tw-animate-fade-up tw-animate-once tw-animate-duration-500 tw-animate-ease-out;
  border-width: clamp(3px, 0.3vw, 6px);
  box-shadow: 0 0 20px 0 #ffefbf;
  border-radius: clamp(16px, 1.5vw, 46px);
  .menu-link {
    @apply tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center tw-no-underline tw-text-[#953C0F] tw-cursor-pointer;
  }
  &:hover {
    /* @apply tw-animate-bounce; */
  }
}
</style>
