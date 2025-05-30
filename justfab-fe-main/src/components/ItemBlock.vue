<script setup>
// const props = defineProps({
//   item: {
//     type: Object,
//     default: () => ({}),
//     required: false,
//   },
// });

const modelValue = defineModel({
  prop: "modelValue",
  event: "update:modelValue",
});
</script>

<template>
  <v-sheet class="" v-if="modelValue && Object.keys(modelValue).length">
    <v-img
      v-if="modelValue.photoUrl"
      :src="srcAsset(modelValue.photoUrl)"
      width="100%"
      class="tw-aspect-square tw-rounded-lg tw-overflow-hidden"
      cover=""
    />
    <div class="tw-text-sm tw-text-center">{{ modelValue.name }}</div>
  </v-sheet>
</template>
