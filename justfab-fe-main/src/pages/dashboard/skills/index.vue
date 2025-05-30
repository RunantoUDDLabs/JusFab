<script setup>
import { getFusedFrom, getFusedInto } from "@/api/admin";
import { load } from "webfontloader";

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
const skillDialogRef = ref(null);
const selectedSkill = ref({});
const itemFusedFrom = ref([]);
const itemFusedInto = ref([]);
const fuseDialogRef = ref(null);

onMounted(async () => {
  await getSkills();
});

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

const openSkillDialog = async (skill) => {
  try {
    skillDialogRef.value.loading = true;

    if (skill && Object.keys(skill).length) {
      selectedSkill.value = await getSkillById(skill._id);
    } else {
      selectedSkill.value = {};
    }

    skillDialogRef.value.openDialog();
  } catch (error) {
    console.error(error);
  } finally {
    skillDialogRef.value.loading = false;
  }
};

const onSaveSuccess = async () => {
  await getSkills();

  clearSelected();
};

const clearSelected = () => {
  selectedSkill.value = {};
};

const openFuseDialog = () => {
  fuseDialogRef.value.openDialog();
};
</script>

<template>
  <div class="tw-flex tw-justify-between tw-items-center tw-mb-6">
    <h1 class="tw-text-2xl tw-font-semibold">{{ $t("Skills") }}</h1>

    <v-btn color="primary" @click="openSkillDialog(null)">
      <v-icon icon="tabler-plus" />
      {{ $t("Add Skill") }}
    </v-btn>
  </div>
  <v-card class="!tw-rounded-2xl" :loading="loading">
    <v-list lines="two" border>
      <template v-for="(skill, index) of adminStore.allSkills" :key="skill._id">
        <v-list-item>
          <VListItemTitle>
            {{ skill.name }}
          </VListItemTitle>
          <VListItemSubtitle class="mt-1">
            <div v-html="skill.description"></div>
          </VListItemSubtitle>

          <template #append>
            <IconBtn class="" @click="openSkillDialog(skill)">
              <v-icon icon="tabler-edit" />
            </IconBtn>
          </template>
        </v-list-item>
      </template>
    </v-list>
  </v-card>

  <skill-dialog
    ref="skillDialogRef"
    v-model="selectedSkill"
    @onSaveSuccess="onSaveSuccess"
    @onDelete=""
    @onCancel="clearSelected"
  />
</template>
