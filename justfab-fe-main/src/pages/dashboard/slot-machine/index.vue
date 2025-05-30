<script setup>
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

const slotMachineForm = ref(null);
const currentReels = ref([]);

onMounted(async () => {
  await getCurrentSlotMachine();
});

const getCurrentSlotMachine = async () => {
  try {
    loading.value = true;
    const configData = await getSlotMachineConfig();

    currentReels.value = configData.reels;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const submitSave = async () => {
  const { valid } = await slotMachineForm.value?.validate();

  if (valid) {
    try {
      loading.value = true;
      const configData = {
        reels: currentReels.value,
      };

      const response = await setSlotMachineConfig(configData);

      appStore.showNotiSnackbar({
        color: "success",
        message: response.message || "Save successfully.",
      });

      await getCurrentSlotMachine();
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
  }
};

const handleBlur = (symbol) => {
  if (symbol.ratio === "" || symbol.ratio === null) {
    symbol.ratio = 0;
  }
};
</script>

<template>
  <v-form ref="slotMachineForm" @submit.prevent="submitSave">
    <div class="tw-flex tw-justify-between tw-items-center tw-mb-6">
      <h1 class="tw-text-2xl tw-font-semibold">{{ $t("Slot Machine") }}</h1>

      <v-btn color="primary" type="submit" :disabled="loading">
        <v-icon icon="mdi-content-save-outline" />
        {{ $t("Save") }}
      </v-btn>
    </div>
    <v-card class="!tw-rounded-2xl" :loading="loading">
      <v-card-text>
        <div class="tw-grid tw-grid-cols-4 tw-gap-5">
          <div
            v-for="(reel, columnIndex) in currentReels"
            :key="columnIndex"
            class="tw-grid tw-gap-5"
          >
            <div v-for="(symbol, rowIndex) in reel.symbols">
              <v-text-field
                v-model="symbol.ratio"
                :label="symbol.symbol"
                outlined
                dense
                clearable
                hide-details="auto"
                :key="symbol._id"
                @blur="handleBlur(symbol)"
              />
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-form>
</template>
