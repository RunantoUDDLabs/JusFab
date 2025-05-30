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
const taskDialogRef = ref(null);
const selectedTask = ref({});
const itemFusedFrom = ref([]);
const itemFusedInto = ref([]);
const fuseDialogRef = ref(null);
const allTasks = ref([]);
const allTaskGroup = ref([]);

const availableGroups = computed(() => {
  return allTaskGroup.value.filter((group) => group.parent != null);
});

onMounted(async () => {
  const p1 = getTasks();
  const p2 = getTaskGroup();

  await Promise.all([p1, p2]);
});

const getTasks = async () => {
  try {
    loading.value = true;
    const tasksResponse = await getAllTasks();

    allTasks.value = tasksResponse;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const getTaskGroup = async () => {
  try {
    loading.value = true;
    const tasksResponse = await getAllTaskGroups();

    allTaskGroup.value = tasksResponse;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const openTaskDialog = async (task) => {
  try {
    taskDialogRef.value.loading = true;

    if (task && Object.keys(task).length) {
      selectedTask.value = await getTask(task._id);
    } else {
      selectedTask.value = {};
    }

    taskDialogRef.value.openDialog();
  } catch (error) {
    console.error(error);
  } finally {
    taskDialogRef.value.loading = false;
  }
};

const onSaveSuccess = async () => {
  await getTasks();

  clearSelected();
};

const clearSelected = () => {
  selectedTask.value = {};
};

const openFuseDialog = () => {
  fuseDialogRef.value.openDialog();
};
</script>

<template>
  <div class="tw-flex tw-justify-between tw-items-center tw-mb-6">
    <h1 class="tw-text-2xl tw-font-semibold">{{ $t("Tasks") }}</h1>

    <v-btn color="primary" @click="openTaskDialog(null)">
      <v-icon icon="tabler-plus" />
      {{ $t("Add Task") }}
    </v-btn>
  </div>
  <v-card class="!tw-rounded-2xl" :loading="loading">
    <v-list lines="two" border>
      <template v-for="(task, index) of allTasks" :key="task._id">
        <v-list-item>
          <VListItemTitle>
            {{ task.title }}
          </VListItemTitle>
          <VListItemSubtitle class="mt-1">
            <div v-html="task.description"></div>
          </VListItemSubtitle>

          <template #append>
            <IconBtn class="" @click="openTaskDialog(task)">
              <v-icon icon="tabler-edit" />
            </IconBtn>
          </template>
        </v-list-item>
      </template>
    </v-list>
  </v-card>

  <task-dialog
    ref="taskDialogRef"
    v-model="selectedTask"
    :taskGroup="availableGroups"
    @onSaveSuccess="onSaveSuccess"
    @onDelete="onSaveSuccess"
    @onCancel="clearSelected"
  />
</template>
