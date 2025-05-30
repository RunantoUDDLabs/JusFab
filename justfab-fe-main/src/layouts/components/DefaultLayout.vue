<script setup></script>

<template>
  <div class="page-wrapper toggled flex">
    <AppBar />

    <v-main class="page-content bg-gray-50 dark:bg-slate-800">
      <router-view />
    </v-main>
  </div>
</template>
