<script setup>
import cloneDeep from "lodash.clonedeep";

const modelValue = defineModel({
  prop: "modelValue",
  event: "update:modelValue",
});

const props = defineProps({});

const emit = defineEmits(["onSave", "onDelete"]);

const { t } = useI18n();
const adminStore = useAdminStore();

const isEdit = computed(() => Boolean(modelValue.value?._id));

const skillForm = ref(null);
const currentSkill = ref({});
const statInput = ref("");

onMounted(() => {});

const submitSave = async () => {
  const { valid } = await skillForm.value?.validate();

  if (valid) {
    emit("onSave", currentSkill.value);
  }
};

const submitDelete = () => {
  emit("onDelete");
};

const addStat = () => {
  if (!statInput.value) {
    return;
  }

  if (!currentSkill.value.requiredStats) {
    currentSkill.value.requiredStats = [];
  }

  currentSkill.value.requiredStats.push(statInput.value);
  statInput.value = "";
};

onUnmounted(() => {});

watch(
  modelValue,
  (newVal) => {
    currentSkill.value = cloneDeep(newVal) || {};
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <div>
    <v-form ref="skillForm" @submit.prevent="submitSave">
      <div class="tw-grid tw-gap-4 tw-grid-cols-1">
        <v-text-field
          v-model="currentSkill.name"
          :label="$t('Name')"
          outlined
          dense
          clearable
          hide-details="auto"
          :rules="[requiredValidator]"
        />

        <v-textarea
          v-model="currentSkill.description"
          :label="$t('Description')"
          outlined
          dense
          clearable
          hide-details="auto"
        />

        <div>
          <label for="requiredStats">{{ $t("Required Stats") }}</label>
          <div class="tw-flex tw-flex-wrap tw-gap-2">
            <v-chip
              v-for="(skill, index) in currentSkill.requiredStats"
              :key="index"
              closable
            >
              <strong>{{ skill }}</strong>
            </v-chip>
          </div>
        </div>
        <v-text-field
          v-model="statInput"
          :label="$t('Add Stat')"
          :hint="$t('Press Enter to add stat')"
          outlined
          dense
          clearable
          @keydown.enter.prevent="addStat"
          hide-details="auto"
        >
        </v-text-field>
      </div>
      <div class="tw-flex tw-flex-wrap tw-mt-4 tw-gap-4 tw-justify-end">
        <v-btn color="primary" type="submit">
          {{ $t("Save") }}
        </v-btn>

        <v-btn
          color="error"
          variant="outlined"
          :disabled="!currentSkill || Object.keys(currentSkill).length === 0"
          @click="submitDelete"
        >
          {{ $t("Delete") }}
        </v-btn>
      </div>
    </v-form>
  </div>
</template>
