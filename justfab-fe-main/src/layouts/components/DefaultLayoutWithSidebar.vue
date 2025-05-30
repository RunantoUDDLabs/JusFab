<script setup>
const appStore = useAppStore();
</script>

<template>
  <div class="page-wrapper toggled">
    <AppBar />

    <LeftSidebar />

    <v-main class="page-content bg-gray-50 dark:bg-slate-800">
      <div class="content-wrapper">
        <router-view />
        <!-- <default-footer /> -->
      </div>
    </v-main>
  </div>
</template>
