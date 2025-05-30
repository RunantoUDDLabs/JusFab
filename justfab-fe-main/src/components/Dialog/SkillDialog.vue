<script setup>
const modelValue = defineModel({
  prop: "modelValue",
  event: "update:modelValue",
});

const props = defineProps({});

const emit = defineEmits(["onSaveSuccess", "onCancel", "onDelete"]);

const { t } = useI18n();
const appStore = useAppStore();
const adminStore = useAdminStore();

const skillDialog = ref(false);
const confirmDeleteDialog = ref(null);
const loading = ref(false);

onMounted(async () => {});

const closeDialog = () => {
  emit("onCancel");

  skillDialog.value = false;
};

const openDialog = () => {
  skillDialog.value = true;
};

const saveSkill = async (skill) => {
  try {
    loading.value = true;

    let response;

    if (modelValue.value && modelValue.value._id) {
      console.log("update");

      response = await updateSkill(skill);
    } else {
      console.log("create");

      const skillPayload = {
        ...skill,
        ...{ slug: stringToSlug(skill.name) },
      };

      response = await createSkill(skillPayload);
    }

    appStore.showNotiSnackbar({
      color: "success",
      message: response.message || "Save successfully.",
    });

    emit("onSaveSuccess");

    closeDialog();
  } catch (error) {
    console.log(error);

    appStore.showNotiSnackbar({
      color: "error",
      message:
        error.message || "Error occurred. Please contact the administrator.",
    });
  } finally {
    loading.value = false;
  }
};

const delSkill = async () => {
  try {
    loading.value = true;

    const response = await deleteSkill(modelValue.value._id);

    appStore.showNotiSnackbar({
      color: "success",
      message: response.message || "Delete successfully.",
    });

    emit("onSaveSuccess");

    closeDialog();
  } catch (error) {
    console.error(error);

    appStore.showNotiSnackbar({
      color: "error",
      message:
        error.message || "Error occurred. Please contact the administrator.",
    });
  } finally {
    loading.value = false;
  }
};

defineExpose({
  loading,
  openDialog,
  closeDialog,
});
</script>

<template>
  <v-dialog v-model="skillDialog" class="!tw-z-[2010]" width="90vw" persistent>
    <DialogCloseBtn @click="closeDialog" />

    <v-card class="!tw-rounded-2xl !tw-p-2 sm:!tw-p-10">
      <v-card-title class="">
        {{ $t("Skill") }}
      </v-card-title>

      <v-card-text class="tw-flex tw-flex-col tw-gap-4 tw-h-full">
        <SkillForm
          v-model="modelValue"
          @update:modelValue="modelValue = $event"
          @onSave="saveSkill"
          @onDelete="confirmDeleteDialog?.openDialog"
        />
      </v-card-text>
    </v-card>

    <ConfirmDialog
      ref="confirmDeleteDialog"
      title="Delete Skill"
      message="Are you sure you want to delete this skill?"
      @onConfirm="delSkill"
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
