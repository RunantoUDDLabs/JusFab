<script setup>
const appStore = useAppStore();

const onModelValueUpdate = (value) => {

  if (value === false) {
    appStore.clearNotiSnackbar();
  }
};
</script>

<template>
  <VSnackbar
    v-model="appStore.isNotiSnackbarVisible"
    vertical
    :timeout="appStore.notiSnackbarContent?.timeout"
    :color="appStore.notiSnackbarContent?.color"
    @update:modelValue="onModelValueUpdate"
  >
    {{ $t(appStore.notiSnackbarContent?.message) }}

    <template #actions>
      <VBtn
        color="secondary"
        @click="appStore.isNotiSnackbarVisible = false"
        variant="flat"
      >
        Close
      </VBtn>
    </template>
  </VSnackbar>
</template>
