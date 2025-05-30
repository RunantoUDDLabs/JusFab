<script setup>
import cloneDeep from "lodash.clonedeep";

const modelValue = defineModel({
  prop: "modelValue",
  event: "update:modelValue",
});

const props = defineProps({
  taskGroup: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["onSave", "onDelete"]);

const { t } = useI18n();
const adminStore = useAdminStore();

const isEdit = computed(() => Boolean(modelValue.value?._id));

const taskForm = ref(null);
const currentTask = ref({});

onMounted(() => {});

const submitSave = async () => {
  const { valid } = await taskForm.value?.validate();

  if (valid) {
    emit("onSave", currentTask.value);
  }
};

const submitDelete = () => {
  emit("onDelete");
};

onUnmounted(() => {});

watch(
  modelValue,
  (newVal) => {
    currentTask.value = cloneDeep(newVal) || {};

    if (!currentTask.value.reward) {
      currentTask.value.reward = {
        type: "",
        value: 0,
      };
    }
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <div>
    <v-form ref="taskForm" @submit.prevent="submitSave">
      <div class="tw-grid tw-gap-4 tw-grid-cols-1">
        <v-text-field
          v-model="currentTask.title"
          :label="$t('Title')"
          outlined
          dense
          clearable
          hide-details="auto"
          :rules="[requiredValidator]"
        />

        <v-textarea
          v-model="currentTask.description"
          :label="$t('Description')"
          outlined
          dense
          clearable
          hide-details="auto"
        />

        <v-select
          v-model="currentTask.type"
          :items="Object.values(TASK_TYPES)"
          :label="$t('Type')"
          outlined
          dense
          hide-details="auto"
          :rules="[requiredValidator]"
        />

        <v-text-field
          v-model="currentTask.target"
          :label="$t('Target')"
          outlined
          dense
          clearable
          hide-details="auto"
        />

        <v-select
          v-model="currentTask.group"
          :items="taskGroup"
          item-title="name"
          item-value="_id"
          :label="$t('Group')"
          outlined
          dense
          hide-details="auto"
          :rules="[requiredValidator]"
        />

        <!-- <v-sheet class="tw-border tw-border-gray-400 tw-gap-4"> -->
        <v-select
          v-model="currentTask.reward.type"
          :items="Object.values(REWARD_TYPES)"
          :label="$t('Reward Type')"
          outlined
          dense
          hide-details="auto"
          :rules="[requiredValidator]"
        />

        <v-text-field
          v-model="currentTask.reward.value"
          :label="$t('Reward Value')"
          outlined
          dense
          clearable
          hide-details="auto"
          type="number"
          :rules="[requiredValidator]"
        />
        <!-- </v-sheet> -->
      </div>
      <div class="tw-flex tw-flex-wrap tw-mt-4 tw-gap-4 tw-justify-end">
        <v-btn color="primary" type="submit">
          {{ $t("Save") }}
        </v-btn>

        <v-btn
          color="error"
          variant="outlined"
          :disabled="!currentTask || Object.keys(currentTask).length === 0"
          @click="submitDelete"
        >
          {{ $t("Delete") }}
        </v-btn>
      </div>
    </v-form>
  </div>
</template>
