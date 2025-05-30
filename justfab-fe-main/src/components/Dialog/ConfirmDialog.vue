<script setup>
const props = defineProps({
  title: {
    type: String,
    required: false,
    default: "Confirm",
  },
  message: String,
  cancelText: {
    type: String,
    required: false,
    default: "No",
  },
  confirmText: {
    type: String,
    required: false,
    default: "Yes",
  },
});

const confirmDialog = ref(false);

const emit = defineEmits(["onConfirm", "onCancel"]);

const openDialog = () => {
  confirmDialog.value = true;
};

const cancelDialog = () => {
  emit("onCancel");
  confirmDialog.value = false;
};

const submitDialog = () => {
  emit("onConfirm");
  confirmDialog.value = false;
};

defineExpose({ openDialog, confirmDialog, cancelDialog });
</script>

<template>
  <v-dialog
    v-model="confirmDialog"
    class="tw-rounded-2xl !tw-z-[2010]"
    width="540"
    persistent
  >
    <v-card class="!tw-rounded-2xl tw-px-4 tw-py-2" min-height="196">
      <v-card-title class="tw-text-center tw-p-0 tw-text-base tw-font-bold">
        {{ $t(title) }}
      </v-card-title>

      <v-card-text class="tw-text-center !tw-px-10 !tw-text-sm">
        {{ $t(message) }}
      </v-card-text>
      <v-card-actions class="tw-flex tw-p-0 tw-min-h-fit">
        <v-btn
          variant="outlined"
          color="primary"
          class="[&>span]:tw-whitespace-break-spaces tw-capitalize tw-text-base [&_*]:! tw-flex-auto"
          @click="cancelDialog"
          v-if="cancelText"
        >
          {{ $t(cancelText) }}
        </v-btn>
        <v-btn
          class="[&>span]:tw-whitespace-break-spaces tw-capitalize tw-text-base tw-flex-auto"
          elevated
          variant="flat"
          color="primary"
          @click="submitDialog"
          v-if="confirmText"
        >
          {{ $t(confirmText) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
