<script setup>
import bgReferred from "@images/game/bg-referred.png";

const userStore = useUserStore();

const referred = ref([]);

onMounted(async () => {
  const { referredUsers } = await getReferralTree(userStore.userData?._id);

  referred.value = referredUsers;
});
</script>

<template>
  <div class="tw-flex tw-flex-col tw-gap-[2%]">
    <div
      v-for="(item, index) in referred"
      :key="index"
      class="tw-bg-cover tw-bg-center tw-bg-no-repeat tw-aspect-[608/152] tw-w-full tw-flex tw-items-center tw-text-[#AE613A]"
      :style="{ backgroundImage: `url(${bgReferred})` }"
    >
      <div class="tw-w-[78%] tw-ml-auto tw-mb-[4%] tw-line-clamp-2">
        {{ item.username }} join by invitation
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.task-completed {
  @apply tw-bg-black/50 tw-rounded-[1em];
  z-index: 1;
}
</style>
