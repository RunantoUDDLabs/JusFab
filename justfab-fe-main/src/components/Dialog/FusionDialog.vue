<script setup>
import cloneDeep from "lodash.clonedeep";

const modelValue = defineModel({
  prop: "modelValue",
  event: "update:modelValue",
});

const emit = defineEmits(["onSave", "onCancel", "onDelete", "onCancelDelete"]);

const adminStore = useAdminStore();

const fusionDialog = ref(false);
const resultItem = ref({});
const requiredItems = ref([]);
const confirmDeleteDialog = ref(null);

const requiredIds = computed(() => requiredItems.value.map((item) => item._id));
const resultId = computed(() => resultItem.value._id);
const isChange = computed(() => {
  return (
    JSON.stringify(requiredItems.value) !==
      JSON.stringify(modelValue.value.requiredItems) ||
    JSON.stringify(resultItem.value) !==
      JSON.stringify(modelValue.value.resultItem)
  );
});

const closeDialog = () => {
  emit("onCancel");
  onClearSelected();
  fusionDialog.value = false;
};

const openDialog = async () => {
  fusionDialog.value = true;

  await nextTick();

  requiredItems.value = modelValue.value.requiredItems.length
    ? cloneDeep(modelValue.value.requiredItems)
    : [];
  resultItem.value = { ...modelValue.value.resultItem } || {};
};

const onSelectItem = (item) => {
  if (!resultItem.value || Object.keys(resultItem.value).length === 0) {
    resultItem.value = item;
    return;
  } else {
    requiredItems.value.push(item);
  }
};

const onClearSelected = () => {
  requiredItems.value = [];
  resultItem.value = {};
};

const onConfirmFuse = () => {
  emit("onSave", {
    requiredItems: requiredIds.value,
    resultItem: resultId.value,
    additionalRequirements: "string",
  });
};

const onRemoveSelected = (index) => {
  requiredItems.value.splice(index, 1);
};

const onRemoveResult = () => {
  resultItem.value = {};
};

const onConfirmDelete = () => {
  emit("onDelete");
};

const onCancelDelete = () => {
  emit("onCancelDelete");
  confirmDeleteDialog.value?.cancelDialog();
};

const openConfirmDeleteDialog = () => {
  confirmDeleteDialog.value?.openDialog();
};

defineExpose({
  fusionDialog,
  openConfirmDeleteDialog,
  openDialog,
  closeDialog,
});
</script>

<template>
  <v-dialog
    v-model="fusionDialog"
    class="!tw-z-[2010]"
    width="90vw"
    height="90vh"
    persistent
  >
    <DialogCloseBtn @click="closeDialog" />

    <v-card class="!tw-rounded-2xl !tw-p-2 sm:!tw-p-10" :loading="loading">
      <v-card-text class="tw-flex tw-flex-col tw-gap-4 tw-h-full">
        <div class="!tw-font-extrabold tw-text-center tw-text-2xl">
          {{ $t("Fusion") }}
        </div>

        <div>{{ $t("Items") }}</div>
        <div class="tw-overflow-y-auto tw-flex-1 tw-min-h-60">
          <div
            class="tw-flex tw-flex-wrap tw-gap-4"
            v-if="adminStore.allItems.length"
          >
            <div
              v-for="(item, index) in adminStore.allItems"
              :key="`item-${index}`"
              class="tw-rounded-lg tw-overflow-hidden tw-border-transparent tw-border-2 tw-border-solid tw-w-28"
              :class="{
                '!tw-border-primary': requiredIds.includes(item._id),
              }"
              @click="onSelectItem(item)"
            >
              <item-block :modelValue="item" />
            </div>
          </div>
        </div>

        <div>
          <div>{{ $t("Result item") }}</div>
          <div @click="onRemoveResult" class="tw-w-32">
            <item-block :modelValue="resultItem" />
          </div>
        </div>

        <div>
          <div>{{ $t("Required items") }}</div>

          <div class="tw-flex tw-flex-wrap tw-gap-4 tw-items-stretch">
            <template v-if="requiredItems.length">
              <div
                class="tw-w-28"
                v-for="(item, index) in requiredItems"
                :key="`selected-${item._id}`"
                @click.stop="onRemoveSelected(index)"
              >
                <item-block :modelValue="item"> </item-block>
              </div>
            </template>
          </div>
        </div>

        <div class="tw-flex tw-flex-wrap tw-mt-4 tw-gap-4 tw-justify-end">
          <v-btn color="error" variant="outlined" @click="onClearSelected">
            {{ $t("Clear") }}
          </v-btn>

          <v-btn color="primary" @click="onConfirmFuse" :disabled="!isChange">
            {{ $t("Confirm") }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <ConfirmDialog
      ref="confirmDeleteDialog"
      title="Delete Fusion"
      message="Are you sure you want to delete this fusion?"
      @onConfirm="onConfirmDelete"
      @onCancel="onCancelDelete"
    />
  </v-dialog>
</template>
