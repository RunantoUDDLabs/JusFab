<script setup>
const props = defineProps({
  icon: {
    type: String,
    required: false,
    default: "mdi-close",
  },
  iconSize: {
    type: String,
    required: false,
    default: "20",
  },
});
</script>

<template>
  <IconBtn variant="elevated" class="v-dialog-close-btn">
    <v-icon :icon="props.icon" :size="props.iconSize" />
  </IconBtn>
</template>

<style lang="postcss" scoped>
.v-dialog-close-btn {
  position: absolute;
  z-index: 1;
  color: rgba(var(--v-theme-on-surface), var(--v-disabled-opacity)) !important;
  inset-block-start: 0.5rem;
  inset-inline-end: 0.5rem;

  border-radius: 0.375rem;
  background-color: rgb(var(--v-theme-surface)) !important;
  block-size: 2rem;
  inline-size: 2rem;
  inset-block-start: 0;
  inset-inline-end: 0;
  transform: translate(0.5rem, -0.5rem);

  &:hover {
    transform: translate(0.3125rem, -0.3125rem);
  }

  .v-btn__overlay {
    display: none;
  }
}
</style>
