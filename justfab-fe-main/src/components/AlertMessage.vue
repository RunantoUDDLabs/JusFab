<script setup>
const appStore = useAppStore();

onMounted(async () => {});
</script>

<template>
  <div
    class="alert-container tw-fixed tw-top-3 tw-right-3 tw-z-[9999] tw-max-w-[300px]"
  >
    <v-alert
      v-for="(alert, index) in appStore.appAlerts"
      :key="index"
      :type="alert.type"
      border="start"
      elevation="2"
      class="mb-3"
      :class="`alert-${index}`"
    >
      {{ alert.message }}
    </v-alert>
  </div>
</template>
