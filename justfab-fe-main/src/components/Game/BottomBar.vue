<script setup>
import bgBottomBar from "@images/game/bg-bottom-bar.png";
import bgBottomBar2 from "@images/game/bg-bottom-bar-2.png";

const route = useRoute();

const bottomBarRef = ref(null);

const isSubmenuActive = (submenu) => {
  if (!submenu) return false;
  return submenu.some((subItem) => route.path.startsWith(subItem.to));
};
</script>

<template>
  <div
    class="tw-w-full !tw-h-auto tw-max-w-full tw-aspect-[1080/170] tw-flex tw-z-10;"
    nav
    ref="bottomBarRef"
  >
    <div
      v-for="(item, index) in gameNav"
      :key="index"
      class="bottom-nav"
      :class="item.class"
      v-ripple="{ class: `text-white` }"
    >
      <span
        v-if="item.isLocked || !item.isLink"
        :class="{
          'bottom-nav-active': isSubmenuActive(item.submenu),
        }"
      >
        <v-menu
          v-if="item.submenu && item.submenu.length"
          location="top end"
          offset="-0.2vh"
          :attach="bottomBarRef"
          :close-on-content-click="false"
          transition="slide-y-reverse-transition"
        >
          <template #activator="{ props }">
            <div
              class="nav-item"
              v-bind="props"
              :style="{ backgroundImage: `url(${bgBottomBar2})` }"
              :class="{
                'nav-locked': item.isLocked,
              }"
            >
              <v-img
                :src="item.icon"
                cover
                class="tw-w-300"
                :class="item.imgClass"
              />
            </div>
          </template>

          <v-list class="game-submenu">
            <v-list-item
              v-for="(subItem, index) in item.submenu"
              :key="index"
              :value="index"
              :class="{ 'submenu-locked': subItem.isLocked }"
              :to="subItem.to"
            >
              <v-list-item-title>{{ subItem.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <div
          v-else
          class="nav-item"
          :style="{ backgroundImage: `url(${bgBottomBar2})` }"
          :class="{ 'nav-locked': item.isLocked }"
        >
          <v-img
            :src="item.icon"
            cover
            class="tw-w-300"
            :class="item.imgClass"
          />
        </div>

        <!-- <v-img :src="lock" cover class="locked-icon" v-if="item.isLocked" /> -->
      </span>

      <router-link
        :to="item.to"
        :exact-active-class="`bottom-nav-active`"
        v-else
      >
        <div
          class="nav-item"
          :style="{ backgroundImage: `url(${bgBottomBar2})` }"
          :class="{ 'nav-locked': item.isLocked }"
        >
          <v-img
            :src="item.icon"
            cover
            class="tw-w-300"
            :class="item.imgClass"
          />
        </div>

        <!-- <v-img :src="lock" cover class="locked-icon" v-if="item.isLocked" /> -->
      </router-link>
    </div>
  </div>
</template>

<style lang="postcss">
.bottom-nav {
  .nav-item {
    @apply tw-bg-left tw-bg-[auto_100%] tw-bg-repeat-x tw-w-full tw-h-full !tw-relative tw-flex tw-justify-center tw-items-center tw-border-0 tw-border-solid tw-border-[#BB6024];
    border-right-width: 0.4vh;
  }
  &:last-child {
    .nav-item {
      @apply tw-border-r-0;
    }
  }
  a {
    @apply tw-block tw-relative tw-w-full tw-h-full;

    .bottom-active {
      @apply tw-hidden;
    }
  }
  .bottom-nav-active {
    .nav-item {
      @apply tw-scale-110 tw-z-[1];
      border-left-width: 0.4vh;
      /* &::after {
        content: "";
        @apply tw-absolute tw-w-full tw-h-full tw-bg-[#FF6208]/50;
      } */
    }
  }
}

.nav-locked {
  filter: grayscale(100%);
}
.locked-icon {
  @apply !tw-absolute tw-right-1/2 tw-bottom-1/2  tw-w-[30%] tw-h-auto;
  transform: translate(-50%, -50%);
  filter: none;
  z-index: 1;
}
.game-submenu {
  @apply !tw-bg-[#E0BC8C] !tw-border-[0.3vh] !tw-border-b-0 tw-border-solid !tw-border-[#BB6024] !tw-rounded-b-none !tw-shadow-none;
  font-size: clamp(0.625rem, 1.5vh, 2.125rem);
  .v-list-item-title {
    @apply tw-text-[#BB6024];
  }
  .submenu-locked {
    .v-list-item-title {
      @apply tw-text-gray-500;
    }
  }
}
</style>
