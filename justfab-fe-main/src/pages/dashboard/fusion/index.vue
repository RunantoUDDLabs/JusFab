<script setup>
import { getFusedFrom, getFusedInto } from "@/api/admin";

definePage({
  meta: {
    layout: "admin",
    requiresAuth: true,
    subject: "Admin",
    action: "manage",
    nav: "vertical",
  },
});

const appStore = useAppStore();
const adminStore = useAdminStore();

const loading = ref(false);
// const dataFusions = ref(null);
const allFusions = ref([]);
const fusionDialogRef = ref(null);
const selectedFusion = ref({});
const itemFusedFrom = ref([]);
const itemFusedInto = ref([]);
const confirmDeleteDialog = ref(null);

// const allFusions = computed(() => dataFusions.value?.data);

onMounted(async () => {
  await fetchData();
});

const fetchData = async () => {
  try {
    loading.value = true;
    const p1 = getAllFusions().then((response) => {
      allFusions.value = response;
    });

    const p2 = await getAllItems().then((response) => {
      adminStore.allItems = response;
    });

    await Promise.all([p1, p2]);
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const openItemDialog = async (item) => {
  try {
    fusionDialogRef.value.loading = true;
    if (item && Object.keys(item).length) {
      selectedFusion.value = await getFusion(item._id);
    } else {
      selectedFusion.value = {};
    }

    fusionDialogRef.value.openDialog();
  } catch (error) {
    console.error(error);
  } finally {
    fusionDialogRef.value.loading = false;
  }
};

const getItemById = async (id) => {
  if (!id) return;

  try {
    fusionDialogRef.value.loading = true;

    const data = await getItem(id);

    return data;
  } catch (error) {
    console.error(error);
  } finally {
    fusionDialogRef.value.loading = false;
  }
};

const saveFusion = async (fusion) => {
  try {
    fusionDialogRef.value.loading = true;

    let response;

    if (selectedFusion.value && Object.keys(selectedFusion.value).length) {
      console.log("update");
      const payload = {
        _id: selectedFusion.value._id,
        ...fusion,
      };

      response = await updateFusion(payload);
    } else {
      console.log("create");
      response = await createFusion(fusion);
    }

    appStore.showNotiSnackbar({
      color: "success",
      message: response.message || "Save successfully.",
    });

    await fetchData();

    fusionDialogRef.value.closeDialog();

    clearSelected();
  } catch (error) {
    console.log(error);

    appStore.showNotiSnackbar({
      color: "error",
      message:
        error.message || "Error occurred. Please contact the administrator.",
    });

    if (!fusionDialogRef.value.fusionDialog) {
      clearSelected();
    }
  } finally {
    fusionDialogRef.value.loading = false;
  }
};

const delFusion = async (item) => {
  if (!item) return;

  try {
    fusionDialogRef.value.loading = true;

    const response = await deleteFusion(item._id);

    appStore.showNotiSnackbar({
      color: "success",
      message: response.message || "Delete successfully.",
    });

    await fetchData();

    fusionDialogRef.value.closeDialog();

    clearSelected();
  } catch (error) {
    console.error(error);

    appStore.showNotiSnackbar({
      color: "error",
      message:
        error.message || "Error occurred. Please contact the administrator.",
    });
  } finally {
    fusionDialogRef.value.loading = false;
  }
};

const submitDelete = async (fusion) => {
  selectedFusion.value = fusion;
  confirmDeleteDialog.value.openDialog();
};

const clearSelected = () => {
  selectedFusion.value = {};
  itemFusedFrom.value = [];
  itemFusedInto.value = [];
};

const openFuseDialog = () => {
  fusionDialogRef.value.openDialog();
};
</script>

<template>
  <div class="tw-flex tw-justify-between tw-items-center tw-mb-6">
    <h1 class="tw-text-2xl tw-font-semibold">{{ $t("Fusions") }}</h1>

    <v-btn color="primary" @click="openFuseDialog(null)">
      <v-icon icon="tabler-plus" />
      {{ $t("Fuse") }}
    </v-btn>
  </div>
  <v-card class="!tw-rounded-2xl" :loading="loading">
    <v-list lines="two" border>
      <template v-for="(fusion, index) of allFusions" :key="fusion._id">
        <v-list-item>
          <template #prepend>
            <!-- <VAvatar :image="srcAsset(fusion.photoUrl)" /> -->
          </template>
          <VListItemTitle>
            <div class="tw-flex tw-flex-wrap tw-gap-2 tw-items-center">
              <div class="tw-w-20">
                <item-block :modelValue="fusion.resultItem" />
              </div>
              =
              <div class="tw-w-14" v-for="item in fusion.requiredItems">
                <item-block :modelValue="item" />
              </div>
            </div>
          </VListItemTitle>
          <VListItemSubtitle class="mt-1">
            <!-- <VBadge
              dot
              location="start center"
              offset-x="2"
              :color="resolveStatusColor[fusion.status]"
              class="me-3"
            >
              <span class="ms-4">{{ fusion.status }}</span>
            </VBadge> -->

            <!-- <span class="text-xs text-disabled">{{ fusion.category }}</span> -->
          </VListItemSubtitle>

          <template #append>
            <IconBtn class="" @click="submitDelete(fusion)">
              <v-icon icon="tabler-trash" />
            </IconBtn>

            <IconBtn class="" @click="openItemDialog(fusion)">
              <v-icon icon="tabler-edit" />
            </IconBtn>
          </template>
        </v-list-item>
      </template>
    </v-list>
  </v-card>

  <fusion-dialog
    ref="fusionDialogRef"
    v-model="selectedFusion"
    :itemFusedFrom="itemFusedFrom"
    :itemFusedInto="itemFusedInto"
    @onSave="saveFusion"
    @onDelete="delFusion"
    @onCancel="clearSelected"
  />

  <ConfirmDialog
    ref="confirmDeleteDialog"
    title="Delete Fusion"
    message="Are you sure you want to delete this fusion?"
    @onConfirm="delFusion(selectedFusion)"
    @onCancel="clearSelected"
  />
</template>
