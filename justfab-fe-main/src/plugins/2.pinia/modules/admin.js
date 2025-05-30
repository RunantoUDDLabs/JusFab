import { defineStore } from "pinia";
import { ref } from "vue";

export const useAdminStore = defineStore("admin", () => {
  const assetsManagerDialog = ref(false);
  const allItems = ref([]);
  const allSkills = ref([]);

  // const getItemById = (id) => {
  //   if (!allItems.value || !allItems.value.length) return null;
  //   return allItems.value.find((item) => item._id === id);
  // };

  return {
    assetsManagerDialog,
    allItems,
    allSkills,
  };
});
