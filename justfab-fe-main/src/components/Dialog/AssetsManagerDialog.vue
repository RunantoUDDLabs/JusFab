<script setup>
import uploadIcon from "@images/svg/upload.svg";
import { emitter } from "@plugins/mitt";

const emit = defineEmits(["onConfirmSelected", "onCancelSelected"]);

const { t } = useI18n();
const appStore = useAppStore();
const adminStore = useAdminStore();

const uploaderRef = ref(null);
const uploadFiles = ref(null);
const allAssets = ref([]);
const selectedId = ref(null);
const confirmDeleteDialog = ref(null);
const loading = ref(false);

onMounted(async () => {
  await getAssets();
});

const closeDialog = () => {
  emit("onCancelSelected");

  adminStore.assetsManagerDialog = false;
};

const openDialog = () => {
  adminStore.assetsManagerDialog = true;
};

const uploadFilesSelected = async () => {
  try {
    if (!uploadFiles.value) return;

    loading.value = true;

    await uploadAsset(uploadFiles.value);

    appStore.showNotiSnackbar({
      color: "success",
      message: t("Upload successfully."),
    });

    await getAssets();
  } catch (error) {
    console.error(error);

    appStore.showNotiSnackbar({
      color: "error",
      message:
        error.message || t("Error occurred. Please contact the administrator."),
    });
  } finally {
    uploadFiles.value = null;

    loading.value = false;
  }
};

const selectFiles = () => {
  uploaderRef.value.selectFiles();
};

const getAssets = async () => {
  try {
    loading.value = true;
    const data = await getAllAssets();

    allAssets.value = data;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const selectAsset = (id) => {
  if (selectedId.value === id) {
    selectedId.value = null;
    return;
  }

  selectedId.value = id;
};

const delAsset = async () => {
  if (!selectedId.value) return;

  try {
    loading.value = true;

    const asset = allAssets.value[selectedId.value];

    const response = await deleteAsset({
      filePath: asset,
    });

    appStore.showNotiSnackbar({
      color: "success",
      message: response.message || "Delete successfully.",
    });

    await getAssets();
  } catch (error) {
    console.error(error);

    appStore.showNotiSnackbar({
      color: "error",
      message:
        error.message || "Error occurred. Please contact the administrator.",
    });
  } finally {
    selectedId.value = null;

    loading.value = false;
  }
};

const onConfirmSelected = () => {
  emitter.emit("onSelectAsset", allAssets.value[selectedId.value]);

  closeDialog();
};

const onConfirmDelete = async () => {
  await delAsset();
};
</script>

<template>
  <v-dialog
    v-model="adminStore.assetsManagerDialog"
    class="!tw-z-[2010]"
    width="90vw"
    height="90vh"
    persistent
  >
    <DialogCloseBtn @click="closeDialog" />

    <v-card class="!tw-rounded-2xl !tw-p-2 sm:!tw-p-10" :loading="loading">
      <v-card-text class="tw-flex tw-flex-col tw-gap-4 tw-h-full">
        <div class="!tw-font-extrabold tw-text-center tw-text-2xl">Assets</div>

        <div
          class="tw-flex tw-items-center tw-justify-center tw-border tw-border-dashed tw-border-gray-300 tw-rounded-2xl tw-p-4"
        >
          <div class="tw-flex tw-justify-center tw-items-center tw-gap-4">
            <v-img :src="uploadIcon" alt="Upload" max-width="40" width="40" />
            <div>
              <span
                class="tw-text-primary tw-font-bold tw-cursor-pointer"
                @click="selectFiles"
              >
                Upload Photos
              </span>
              <span style="color: #666">or just drag and drop</span>
            </div>
          </div>

          <InputUploadFiles
            ref="uploaderRef"
            v-model="uploadFiles"
            @update:modelValue="uploadFilesSelected"
          />
        </div>

        <div class="tw-overflow-y-auto tw-flex-1">
          <!-- <div
            class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-3 md:tw-grid-cols-4 tw-gap-10 tw-mt-4"
          > -->
          <div
            class="sm:tw-col-span-2 md:tw-col-span-3 tw-grid tw-grid-cols-3 md:tw-grid-cols-6 tw-gap-4"
            v-if="allAssets.length"
          >
            <div
              v-for="(asset, index) in allAssets"
              :key="`asset-${index}`"
              class="tw-rounded-lg tw-overflow-hidden tw-border-transparent tw-border-2 tw-border-solid tw-aspect-square tw-flex tw-items-center tw-justify-center tw-cursor-pointer tw-bg-gray-100"
              :class="{
                '!tw-border-primary': selectedId === index,
              }"
            >
              <v-img
                :src="srcAsset(asset)"
                class=""
                cover
                @click="selectAsset(index)"
              />
            </div>

            <!-- <img
              src="https://via.placeholder.com/150"
              alt="Photo 1"
              style="width: 100%; border-radius: 5px"
            /> -->
          </div>
        </div>
        <!-- </div> -->

        <div class="tw-flex tw-flex-wrap tw-mt-4 tw-gap-4 tw-justify-end">
          <v-btn
            color="error"
            variant="outlined"
            :disabled="selectedId === null"
            @click="confirmDeleteDialog?.openDialog"
          >
            {{ $t("Delete") }}
          </v-btn>

          <v-btn color="primary" @click="onConfirmSelected">
            {{ $t("Confirm") }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <ConfirmDialog
      ref="confirmDeleteDialog"
      title="Delete Asset"
      message="Are you sure you want to delete this asset?"
      @onConfirm="onConfirmDelete"
      @onCancel="confirmDeleteDialog?.cancelDialog"
    />
  </v-dialog>
</template>
