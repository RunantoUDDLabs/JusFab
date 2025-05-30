<script setup></script>

<template>
  <div class="h-full blank-layout">
    <RouterView #="{ Component }">
      <Component :is="Component" />
    </RouterView>

    <LoadingGame />
  </div>
</template>
