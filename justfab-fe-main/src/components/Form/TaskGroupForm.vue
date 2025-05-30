<script setup>
import cloneDeep from "lodash.clonedeep";

const modelValue = defineModel({
  prop: "modelValue",
  event: "update:modelValue",
});

const props = defineProps({
  groupsParent: {
    type: Object,
    default: () => {},
  },
});

const emit = defineEmits(["onSave", "onDelete"]);

const { t } = useI18n();
const adminStore = useAdminStore();

const isEdit = computed(() => Boolean(modelValue.value?._id));

const taskGroupForm = ref(null);
const currentTaskGroup = ref({});

onMounted(() => {});

const submitSave = async () => {
  const { valid } = await taskGroupForm.value?.validate();

  if (valid) {
    emit("onSave", currentTaskGroup.value);
  }
};

const submitDelete = () => {
  emit("onDelete");
};

onUnmounted(() => {});

watch(
  modelValue,
  (newVal) => {
    currentTaskGroup.value = cloneDeep(newVal) || {};
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <div>
    <v-form ref="taskGroupForm" @submit.prevent="submitSave">
      <div class="tw-grid tw-gap-4 tw-grid-cols-1">
        <v-text-field
          v-model="currentTaskGroup.name"
          :label="$t('Title')"
          outlined
          dense
          clearable
          hide-details="auto"
          :rules="[requiredValidator]"
        />

        <!-- <v-text-field
          v-model="currentTaskGroup.icon"
          :label="$t('Target')"
          outlined
          dense
          clearable
          hide-details="auto"
        /> -->

        <v-select
          v-model="currentTaskGroup.parent"
          :items="groupsParent"
          item-title="name"
          item-value="_id"
          :label="$t('Group')"
          outlined
          dense
          hide-details="auto"
        />
      </div>
      <div class="tw-flex tw-flex-wrap tw-mt-4 tw-gap-4 tw-justify-end">
        <v-btn color="primary" type="submit">
          {{ $t("Save") }}
        </v-btn>

        <v-btn
          color="error"
          variant="outlined"
          :disabled="
            !currentTaskGroup || Object.keys(currentTaskGroup).length === 0
          "
          @click="submitDelete"
        >
          {{ $t("Delete") }}
        </v-btn>
      </div>
    </v-form>
  </div>
</template>
