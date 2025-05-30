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
const dataItems = ref(null);
const itemDialogRef = ref(null);
const selectedItem = ref({});
const itemFusedFrom = ref([]);
const itemFusedInto = ref([]);
const fuseDialogRef = ref(null);

onMounted(async () => {
  const p1 = getItems();
  const p2 = getSkills();

  await Promise.all([p1, p2]);
});

const getItems = async () => {
  try {
    loading.value = true;
    dataItems.value = await getAllItems();

    adminStore.allItems = dataItems.value;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const getSkills = async () => {
  try {
    loading.value = true;
    const skillsResponse = await getAllSkills();

    adminStore.allSkills = skillsResponse;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const openItemDialog = async (item) => {
  try {
    itemDialogRef.value.loading = true;

    if (item && Object.keys(item).length) {
      const p1 = getItemById(item._id).then((responseItem) => {
        selectedItem.value = responseItem;
      });

      // const p2 = getFusedInto(item._id).then((responseFusedInto) => {
      //   console.log(responseFusedInto);
      //   itemFusedInto.value = responseFusedInto;
      // });

      // const p3 = getFusedFrom(item._id).then((responseFusedFrom) => {
      //   console.log(responseFusedFrom);
      //   itemFusedFrom.value = responseFusedFrom;
      // });

      await Promise.all([p1]);
    } else {
      selectedItem.value = {};
    }

    itemDialogRef.value.openDialog();
  } catch (error) {
    console.error(error);
  } finally {
    itemDialogRef.value.loading = false;
  }
};

const getItemById = async (id) => {
  if (!id) return;

  try {
    itemDialogRef.value.loading = true;

    const data = await getItem(id);

    return data;
  } catch (error) {
    console.error(error);
  } finally {
    itemDialogRef.value.loading = false;
  }
};

const saveItem = async (item) => {
  try {
    itemDialogRef.value.loading = true;

    let response;

    if (selectedItem.value && Object.keys(selectedItem.value).length) {
      console.log("update");

      const itemId = item._id;
      const { _id, ...itemPayload } = item;

      response = await updateItem(itemId, itemPayload);
    } else {
      console.log("create");
      response = await createItem(item);
    }

    appStore.showNotiSnackbar({
      color: "success",
      message: response.message || "Save successfully.",
    });

    await getItems();

    itemDialogRef.value.closeDialog();

    clearSelected();
  } catch (error) {
    console.log(error);

    appStore.showNotiSnackbar({
      color: "error",
      message:
        error.message || "Error occurred. Please contact the administrator.",
    });
  } finally {
    itemDialogRef.value.loading = false;
  }
};

const delItem = async (item) => {
  if (!item) return;

  try {
    itemDialogRef.value.loading = true;

    const response = await deleteItem(item._id);

    appStore.showNotiSnackbar({
      color: "success",
      message: response.message || "Delete successfully.",
    });

    await getItems();

    itemDialogRef.value.closeDialog();

    clearSelected();
  } catch (error) {
    console.error(error);

    appStore.showNotiSnackbar({
      color: "error",
      message:
        error.message || "Error occurred. Please contact the administrator.",
    });
  } finally {
    itemDialogRef.value.loading = false;
  }
};

const clearSelected = () => {
  selectedItem.value = {};
  itemFusedFrom.value = [];
  itemFusedInto.value = [];
};

const openFuseDialog = () => {
  fuseDialogRef.value.openDialog();
};
</script>

<template>
  <div class="tw-flex tw-justify-between tw-items-center tw-mb-6">
    <h1 class="tw-text-2xl tw-font-semibold">{{ $t("Items") }}</h1>

    <v-btn color="primary" @click="openItemDialog(null)">
      <v-icon icon="tabler-plus" />
      {{ $t("Add Item") }}
    </v-btn>
  </div>
  <v-card class="!tw-rounded-2xl" :loading="loading">
    <v-list lines="two" border>
      <template v-for="(item, index) of adminStore.allItems" :key="item._id">
        <v-list-item>
          <template #prepend>
            <!-- <VAvatar :image="srcAsset(item.photoUrl)" /> -->
            <!-- {{ ITEM_RARITIES[item.rarity].background }} -->
            <div
              class="tw-aspect-square tw-w-14 tw-mr-3 tw-bg-cover tw-bg-center tw-bg-no-repeat tw-relative tw-flex tw-justify-center tw-items-center"
              :style="{
                backgroundImage: `url(${
                  ITEM_RARITIES[item.rarity].background
                })`,
              }"
            >
              <v-img
                :src="srcAsset(item.photoUrl)"
                class="!tw-max-w-[75%] tw-w-full tw-h-auto"
              />
            </div>
          </template>
          <VListItemTitle>
            {{ item.name }}
          </VListItemTitle>
          <VListItemSubtitle class="mt-1">
            <span class="text-xs text-disabled">{{ item.category }}</span>
          </VListItemSubtitle>

          <template #append>
            <IconBtn class="" @click="openItemDialog(item)">
              <v-icon icon="tabler-edit" />
            </IconBtn>
          </template>
        </v-list-item>
      </template>
    </v-list>
  </v-card>

  <item-dialog
    ref="itemDialogRef"
    v-model="selectedItem"
    :itemFusedFrom="itemFusedFrom"
    :itemFusedInto="itemFusedInto"
    @onSave="saveItem"
    @onDelete="delItem"
    @onCancel="clearSelected"
  />
</template>
