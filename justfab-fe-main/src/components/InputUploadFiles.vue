<script setup>
const props = defineProps({
  accept: {
    type: String,
    default: "*",
  },
  multiple: {
    type: Boolean,
    default: false,
  },
});

const modelValue = defineModel({
  prop: "modelValue",
  event: "update:modelValue",
});

const emit = defineEmits(["update:modelValue", "onLoadFiles"]);

const uploaderRef = ref(null);

const selectFiles = () => {
  uploaderRef.value.click();
};

const onFileChanged = async (e) => {
  if (!e.target.files.length) return;

  modelValue.value = props.multiple
    ? Array.from(e.target.files)
    : e.target.files[0];

  await nextTick();

  e.target.value = "";
};

const onLoadFile = async () => {
  await nextTick();

  if (!modelValue.value) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    emit("onLoadFiles", modelValue.value);
  };

  reader.readAsDataURL(modelValue.value);
};

defineExpose({
  selectFiles,
  onLoadFile,
});
</script>

<template>
  <input
    ref="uploaderRef"
    class="d-none"
    type="file"
    :accept="accept"
    :multiple="multiple"
    @change="onFileChanged"
  />
</template>
