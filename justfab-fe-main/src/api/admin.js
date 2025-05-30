import { $apiGame } from "@/plugins/axios";
import { store } from "@store";

const adminStore = useAdminStore(store);

const API = {
  asset: {
    upload: "/asset/upload",
    all: "/asset/all",
    delete: "/asset/delete",
  },
  item: {
    all: "/item",
    item: "/item/:id",
    create: "/item",
    update: "/item/:id",
    delete: "/item/:id",
  },
  fusion: {
    all: "/fusion",
    fusion: "/fusion/:id",
    create: "/fusion",
    update: "/fusion/:id",
    delete: "/fusion/:id",
    fusedInto: "/fusion/fused-into/:id",
    fusedFrom: "/fusion/fused-from/:id",
  },
  skill: {
    all: "/skill",
    get: "/skill/:skillId",
    create: "/skill",
    update: "/skill/:skillId",
    delete: "/skill/:skillId",
  },
  task: {
    all: "/task",
    task: "/task/:id",
    create: "/task",
    update: "/task/:id",
    delete: "/task/:id",
    complete: "/task/:id/complete",
  },
  taskGroup: {
    all: "/taskGroup",
    taskGroup: "/taskGroup/:id",
    create: "/taskGroup",
    update: "/taskGroup/:id",
    delete: "/taskGroup/:id",
    deleteTask: "/taskGroup/task/:taskId",
  },
  user: {
    all: "/user/all",
  },
  refferal: {
    tree: "/referral/tree/:userId",
  },
};

export const uploadAsset = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await $apiGame.post(API.asset.upload, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const getAllAssets = async () => {
  try {
    const res = await $apiGame.get(API.asset.all);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const deleteAsset = async (payload) => {
  try {
    const res = await $apiGame.delete(API.asset.delete, {
      data: payload,
    });

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const getAllItems = async () => {
  try {
    const res = await $apiGame.get(API.item.all);

    adminStore.allItems = res.data;
    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const getItem = async (id) => {
  try {
    const url = getApiPath(API.item.item, { id: id });
    const res = await $apiGame.get(url);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const createItem = async (payload) => {
  try {
    const res = await $apiGame.post(API.item.create, payload);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const updateItem = async (itemId, payload) => {
  try {
    const url = getApiPath(API.item.update, { id: itemId });
    const res = await $apiGame.put(url, payload);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const deleteItem = async (id) => {
  try {
    const url = getApiPath(API.item.delete, { id: id });
    const res = await $apiGame.delete(url);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const getAllSkills = async () => {
  try {
    const url = getApiPath(API.skill.all);
    const res = await $apiGame.get(url);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const getSkillById = async (skillId) => {
  try {
    const url = getApiPath(API.skill.get, { skillId: skillId });
    const res = await $apiGame.get(url);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const createSkill = async (payload) => {
  try {
    const url = getApiPath(API.skill.create);
    const res = await $apiGame.post(url, payload);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const updateSkill = async (payload) => {
  try {
    const url = getApiPath(API.skill.update, { skillId: payload._id });
    const res = await $apiGame.put(url, payload);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const deleteSkill = async (skillId) => {
  try {
    const url = getApiPath(API.skill.delete, { skillId: skillId });
    const res = await $apiGame.delete(url);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const getAllFusions = async () => {
  try {
    const res = await $apiGame.get(API.fusion.all);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const getFusion = async (id) => {
  try {
    const url = getApiPath(API.fusion.fusion, { id: id });
    const res = await $apiGame.get(url);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const createFusion = async (payload) => {
  try {
    const res = await $apiGame.post(API.fusion.create, payload);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const updateFusion = async (payload) => {
  try {
    const url = getApiPath(API.fusion.update, { id: payload._id });
    const res = await $apiGame.patch(url, payload);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const deleteFusion = async (id) => {
  try {
    const url = getApiPath(API.fusion.delete, { id: id });
    const res = await $apiGame.delete(url);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const getFusedInto = async (id) => {
  try {
    const url = getApiPath(API.fusion.fusedInto, { id: id });
    const res = await $apiGame.get(url);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const getFusedFrom = async (id) => {
  try {
    const url = getApiPath(API.fusion.fusedFrom, { id: id });
    const res = await $apiGame.get(url);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const getAllTasks = async () => {
  try {
    const res = await $apiGame.get(API.task.all);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const getTask = async (id) => {
  try {
    const url = getApiPath(API.task.task, { id: id });
    const res = await $apiGame.get(url);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const createTask = async (payload) => {
  try {
    const res = await $apiGame.post(API.task.create, payload);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const updateTask = async (payload) => {
  try {
    const url = getApiPath(API.task.update, { id: payload._id });
    const res = await $apiGame.put(url, payload);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const deleteTask = async (id) => {
  try {
    const url = getApiPath(API.task.delete, { id: id });
    const res = await $apiGame.delete(url);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const completeTask = async (id) => {
  try {
    const url = getApiPath(API.task.complete, { id: id });
    const res = await $apiGame.post(url);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const getAllTaskGroups = async () => {
  try {
    const res = await $apiGame.get(API.taskGroup.all);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const getTaskGroupById = async (id) => {
  try {
    const url = getApiPath(API.taskGroup.taskGroup, { id: id });
    const res = await $apiGame.get(url);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const createTaskGroup = async (payload) => {
  try {
    const res = await $apiGame.post(API.taskGroup.create, payload);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const updateTaskGroup = async (payload) => {
  try {
    const url = getApiPath(API.taskGroup.update, { id: payload._id });
    const res = await $apiGame.put(url, payload);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const deleteTaskGroup = async (id) => {
  try {
    const url = getApiPath(API.taskGroup.delete, { id: id });
    const res = await $apiGame.delete(url);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const getAllUsers = async (payload) => {
  try {
    const res = await $apiGame.get(API.user.all, {
      params: payload,
    });

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};

export const getReferralTree = async (userId) => {
  try {
    const url = getApiPath(API.refferal.tree, { userId: userId });
    const res = await $apiGame.get(url);

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
};
