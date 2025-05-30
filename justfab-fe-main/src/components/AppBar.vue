<script setup>
import { themeConfig } from "@themeConfig";
import { VNodeRenderer } from "@layouts/components/VNodeRenderer";

const submitLogout = () => {};
</script>

<template>
  <VAppBar :color="themeConfig.horizontalNav.color">
    <VAppBarTitle class="tw-justify-center">
      <div class="tw-flex tw-items-center tw-font-extrabold tw-gap-2">
        <VNodeRenderer :nodes="themeConfig.app.logo" />
        {{ themeConfig.app.title }}
      </div>
    </VAppBarTitle>

    <div class="tw-me-5">
      <VMenu>
        <template v-slot:activator="{ props }">
          <UserAvatar v-bind="props" class="cursor-pointer" />
        </template>
        <v-list>
          <v-list-item :to="`/change-password`">
            <v-list-item-title>{{ $t("Change password") }}</v-list-item-title>
          </v-list-item>

          <v-list-item @click="submitLogout">
            <v-list-item-title>{{ $t("Sign out") }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </VMenu>
    </div>
  </VAppBar>
</template>
