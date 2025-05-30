<script setup>
import { themeConfig } from "@themeConfig";
// import tagline from "@images/tagline.png";

import { useDisplay } from "vuetify";

const appStore = useAppStore();
const userStore = useUserStore();
const { mdAndUp } = useDisplay();

const drawer = ref(true);
const rail = ref(false);

watch(
  () => mdAndUp.value,
  (newValue) => {
    if (newValue) {
      appStore.expandVerticalNav = true;
    } else {
      appStore.expandVerticalNav = false;
    }
  }
);
</script>

<template>
  <!-- sidebar-wrapper -->
  <v-navigation-drawer
    :rail="!appStore.expandVerticalNav"
    permanent
    :color="themeConfig.verticalNav.color"
    :width="themeConfig.verticalNav.widthVerticalNav"
    :photoUrl="themeConfig.verticalNav.background"
  >
    <v-list-item nav>
      <span v-if="appStore.expandVerticalNav">
        {{ $t("Hello") }}, {{ userStore.userData?.displayName }}
      </span>

      <template v-slot:prepend>
        <v-btn
          icon="mdi-chevron-right-circle"
          variant="text"
          @click.stop="appStore.expandVerticalNav = true"
          v-if="!appStore.expandVerticalNav"
          size="40"
          :ripple="false"
        ></v-btn>
      </template>

      <template v-slot:append>
        <v-btn
          icon="mdi-chevron-left-circle"
          variant="text"
          @click.stop="appStore.expandVerticalNav = false"
          v-if="appStore.expandVerticalNav"
          size="40"
          :ripple="false"
        ></v-btn>
      </template>
    </v-list-item>

    <v-divider></v-divider>

    <v-list density="comfortable" nav>
      <v-list-item
        v-for="item in verticalNav"
        class="rounded-full text-center text-lg"
        :link="item.isLink"
        :to="item.isLink && item.to ? item.to : null"
        :href="item.isLink && item.href ? item.href : null"
        :target="item.isLink && item.href ? '_blank' : ''"
        base-color="primary"
      >
        <template v-slot:prepend>
          <v-icon
            v-if="!appStore.expandVerticalNav"
            :icon="item.icon"
            size="24"
          ></v-icon>
        </template>
        <v-list-item-title class="!tw-text-base">
          {{ $t(item.title) }}
        </v-list-item-title>
      </v-list-item>
    </v-list>

    <template v-slot:append>
      <div class="pa-2">
        <!-- <v-img :src="tagline" /> -->
      </div>
    </template>
  </v-navigation-drawer>

  <!-- sidebar-wrapper  -->
</template>
