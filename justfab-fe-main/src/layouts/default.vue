<script setup>
const route = useRoute();
const router = useRouter();

const DefaultLayout = defineAsyncComponent(() =>
  import("./components/DefaultLayout.vue")
);
const DefaultLayoutWithSidebar = defineAsyncComponent(() =>
  import("./components/DefaultLayoutWithSidebar.vue")
);

onMounted(async () => {});
</script>

<template>
  <div class="default-layout">
    <Component
      :is="
        route.meta.nav === 'vertical' ? DefaultLayoutWithSidebar : DefaultLayout
      "
    />
  </div>
</template>
