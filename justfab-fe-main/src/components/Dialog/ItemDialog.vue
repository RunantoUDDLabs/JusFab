<script setup>
import uploadIcon from "@images/svg/upload.svg";

const modelValue = defineModel({
  prop: "modelValue",
  event: "update:modelValue",
});

const props = defineProps({
  itemFusedFrom: {
    type: Array,
    default: () => [],
    required: false,
  },
  itemFusedInto: {
    type: Array,
    default: () => [],
    required: false,
  },
});

const emit = defineEmits(["onSave", "onCancel", "onDelete"]);

const { t } = useI18n();
const appStore = useAppStore();
const adminStore = useAdminStore();

const itemDialog = ref(false);
const confirmDeleteDialog = ref(null);
const loading = ref(false);

onMounted(async () => {});

const closeDialog = () => {
  emit("onCancel");

  itemDialog.value = false;
};

const openDialog = () => {
  itemDialog.value = true;
};

const onSave = (item) => {
  emit("onSave", item);
};

const onDelete = async () => {
  emit("onDelete", modelValue.value);
};

defineExpose({
  loading,
  openDialog,
  closeDialog,
});
</script>

<template>
  <v-dialog
    v-model="itemDialog"
    class="!tw-z-[2010]"
    width="90vw"
    height="90vh"
    persistent
  >
    <DialogCloseBtn @click="closeDialog" />

    <v-card class="!tw-rounded-2xl !tw-p-2 sm:!tw-p-10">
      <v-card-title class="">
        {{ $t("Item") }}
      </v-card-title>

      <v-card-text class="tw-flex tw-flex-col tw-gap-4">
        <ItemForm
          v-model="modelValue"
          @update:modelValue="modelValue = $event"
          @onSave="onSave"
          @onDelete="confirmDeleteDialog?.openDialog"
        />
      </v-card-text>
    </v-card>

    <ConfirmDialog
      ref="confirmDeleteDialog"
      title="Delete Item"
      message="Are you sure you want to delete this item?"
      @onConfirm="onDelete"
    />

    <v-overlay :model-value="loading" class="tw-justify-center tw-items-center">
      <v-progress-circular
        color="primary"
        size="64"
        contained
      ></v-progress-circular>
    </v-overlay>
  </v-dialog>
</template>
