<script setup>
import cloneDeep from "lodash.clonedeep";
import { emitter } from "@plugins/mitt";

const modelValue = defineModel({
  prop: "modelValue",
  event: "update:modelValue",
});

const props = defineProps();

const emit = defineEmits(["onSave", "onDelete"]);

const { t } = useI18n();
const adminStore = useAdminStore();

const isEdit = computed(() => Boolean(modelValue.value?._id));

const itemForm = ref(null);
const currentItem = ref({});
const loading = ref(false);

onMounted(() => {
  emitter.on("onSelectAsset", changePhotoUrl);
});

const submitSave = async () => {
  const { valid } = await itemForm.value?.validate();

  if (valid) {
    emit("onSave", currentItem.value);
  }
};

const submitDelete = () => {
  emit("onDelete");
};

const changePhotoUrl = (asset) => {
  currentItem.value.photoUrl = asset;
};

const isChecked = (rarity) => {
  if (!currentItem.value?.supportedRarities) {
    currentItem.value.supportedRarities = [];
  }
  return currentItem.value?.supportedRarities?.includes(rarity) || false;
};

const toggleRarity = (rarity, checked) => {
  if (checked) {
    if (!currentItem.value.supportedRarities.includes(rarity)) {
      currentItem.value.supportedRarities.push(rarity);
    }
  } else {
    currentItem.value.supportedRarities =
      currentItem.value.supportedRarities.filter((item) => item !== rarity);
  }
};

const addSkillToRarity = (rarity, skill) => {
  if (!skill) return;

  const stats = skill.requiredStats.reduce((acc, key) => {
    acc[key] = skill[key] || 0;
    return acc;
  }, {});

  const skillObject = {
    skill: skill._id,
    stats,
  };

  if (!Array.isArray(currentItem.value.raritySkills[rarity])) {
    currentItem.value.raritySkills[rarity] = [];
  }

  if (
    !currentItem.value.raritySkills[rarity].some(
      (item) => item.skill === skillObject.skill
    )
  ) {
    currentItem.value.raritySkills[rarity].push(skillObject);
  }
};

const getSkillById = (id) => {
  if (!id) return;

  return adminStore.allSkills.find((item) => item._id === id);
};

const removeSkill = (rarity, id) => {
  if (!id) return;

  const index = currentItem.value.raritySkills[rarity].findIndex(
    (item) => item.skill === id
  );

  if (index !== -1) {
    currentItem.value.raritySkills[rarity].splice(index, 1);
  }
};

onUnmounted(() => {
  emitter.off("onSelectAsset", changePhotoUrl);
});

watch(
  modelValue,
  (newVal) => {
    currentItem.value = cloneDeep(newVal) || {};

    if (!currentItem.value.raritySkills) {
      currentItem.value.raritySkills = {};
    }

    if (!currentItem.value.baseStats) {
      currentItem.value.baseStats = {
        hp: 0,
        attack: 0,
        defense: 0,
        luck: 0,
      };
    }
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <div>
    <v-form ref="itemForm" @submit.prevent="submitSave">
      <div
        class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-3 md:tw-grid-cols-5 tw-gap-4 tw-mb-6"
      >
        <div class="tw-col-span-1 tw-row-span-1 sm:tw-row-span-2">
          <div @click="adminStore.assetsManagerDialog = true">
            <v-img
              :src="
                currentItem.photoUrl
                  ? srcAsset(currentItem.photoUrl)
                  : 'https://placehold.co/400x400?text=Add+Image'
              "
              aspect-ratio="1"
              class="tw-w-full tw-h-auto tw-rounded-lg"
            />
          </div>
        </div>

        <div class="tw-col-span-1 sm:tw-col-span-2 md:tw-col-span-4">
          <div class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-4">
            <div class="tw-col-span-1 sm:tw-col-span-2">
              <v-text-field
                v-model="currentItem.name"
                :label="$t('Name')"
                outlined
                dense
                clearable
                hide-details="auto"
                :rules="[requiredValidator]"
              />
            </div>

            <div class="tw-col-span-1 sm:tw-col-span-1">
              <!-- <v-text-field
                v-model="currentItem.rarity"
                :label="$t('Init Rarity')"
                outlined
                dense
                clearable
                hide-details="auto"
                class="[&_input]:tw-uppercase"
                :rules="[requiredValidator]"
              /> -->
              <v-select
                v-model="currentItem.rarity"
                :items="Object.values(ITEM_RARITIES)"
                item-title="name"
                :label="$t('Init Rarity')"
                outlined
                dense
                hide-details="auto"
                :rules="[requiredValidator]"
              />
            </div>

            <div class="tw-col-span-1 sm:tw-col-span-1">
              <v-select
                v-model="currentItem.category"
                :items="Object.values(ITEM_CATEGORIES)"
                :label="$t('Category')"
                outlined
                dense
                hide-details="auto"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="tw-grid tw-gap-4 tw-grid-cols-2 tw-mb-6">
        <div class="">
          <v-card-subtitle class="!tw-font-bold tw-mb-5">{{
            $t("Basic Stats")
          }}</v-card-subtitle>
          <div class="tw-mb-4">
            <v-text-field
              v-model="currentItem.baseStats.hp"
              :label="$t('HP')"
              outlined
              dense
              clearable
              hide-details="auto"
              type="number"
            />
          </div>

          <div class="tw-mb-4">
            <v-text-field
              v-model="currentItem.baseStats.attack"
              :label="$t('Attack')"
              outlined
              dense
              clearable
              hide-details="auto"
              type="number"
            />
          </div>

          <div class="tw-mb-4">
            <v-text-field
              v-model="currentItem.baseStats.defense"
              :label="$t('Defense')"
              outlined
              dense
              clearable
              hide-details="auto"
              type="number"
            />
          </div>

          <div class="tw-mb-4">
            <v-text-field
              v-model="currentItem.baseStats.luck"
              :label="$t('Luck')"
              outlined
              dense
              clearable
              hide-details="auto"
              type="number"
            />
          </div>

          <div class="tw-mb-4">
            <v-textarea
              v-model="currentItem.description"
              :label="$t('Description')"
              outlined
              dense
              clearable
              hide-details="auto"
            />
          </div>
        </div>

        <div>
          <v-card-subtitle class="!tw-font-bold tw-mb-5">{{
            $t("Rarity")
          }}</v-card-subtitle>

          <v-expansion-panels flat>
            <template
              v-for="rarity in Object.values(ITEM_RARITIES)"
              :key="rarity.name"
            >
              <v-expansion-panel bg-color="#F5F5F5">
                <v-expansion-panel-title>
                  <v-checkbox
                    :model-value="isChecked(rarity.name)"
                    @update:model-value="toggleRarity(rarity.name, $event)"
                    density="compact"
                  />
                  {{ rarity.name }}
                </v-expansion-panel-title>

                <v-expansion-panel-text>
                  <v-autocomplete
                    :items="adminStore.allSkills"
                    item-title="name"
                    :item-value="(item) => item"
                    :label="$t('Add Skill')"
                    outlined
                    dense
                    clearable
                    hide-details="auto"
                    @update:model-value="
                      (selectedSkill) =>
                        addSkillToRarity(rarity.name, selectedSkill)
                    "
                  ></v-autocomplete>

                  <v-card
                    flat
                    color="transparent"
                    v-for="skill in currentItem.raritySkills[rarity.name]"
                  >
                    <v-card-title>
                      {{ getSkillById(skill.skill).name }}
                      <v-btn
                        variant="text"
                        @click.stop="removeSkill(rarity.name, skill.skill)"
                        >Remove</v-btn
                      >
                    </v-card-title>

                    <v-card-text>
                      <div
                        class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4"
                      >
                        <template
                          v-for="[key, value] in Object.entries(skill.stats)"
                        >
                          <v-text-field
                            v-model="skill.stats[key]"
                            :label="key"
                            outlined
                            dense
                            clearable
                            hide-details="auto"
                            type="number"
                          />
                        </template>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </template>
          </v-expansion-panels>
        </div>
      </div>
      <div class="tw-flex tw-flex-wrap tw-mt-4 tw-gap-4 tw-justify-end">
        <v-btn color="primary" type="submit" :disabled="loading">
          {{ $t("Save") }}
        </v-btn>

        <v-btn
          color="error"
          variant="outlined"
          :disabled="
            !currentItem || Object.keys(currentItem).length === 0 || loading
          "
          @click="submitDelete"
        >
          {{ $t("Delete") }}
        </v-btn>
      </div>
    </v-form>
  </div>
</template>
