import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";
import VueRouter from "unplugin-vue-router/vite";
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import Components from "unplugin-vue-components/vite";
import Layouts from "vite-plugin-vue-layouts";
import AutoImport from "unplugin-auto-import/vite";
import {
  VueRouterAutoImports,
  getPascalCaseRouteName,
} from "unplugin-vue-router";
import compression from "vite-plugin-compression";

// import { Vuetify3Resolver } from "unplugin-vue-components/resolvers";

// import pluginRewriteAll from "vite-plugin-rewrite-all";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig(({ mode }) => {
  const base = mode === "staging" ? "/smk/" : "/";

  return {
    base,
    plugins: [
      // basicSsl(),

      VueRouter({
        getRouteName: (routeNode) => {
          // Convert pascal case to kebab case
          return getPascalCaseRouteName(routeNode)
            .replace(/([a-z\d])([A-Z])/g, "$1-$2")
            .toLowerCase();
        },
        beforeWriteFiles: (root) => {}, // Giữ nguyên logic
        // where to generate the types
        dts: "./typed-router.d.ts",
      }),

      vue({
        template: {
          // support for custom elements and remove the unknown element warnings
          // compilerOptions,
          // support for asset url conversion
          // transformAssetUrls,
        },
      }),

      vuetify({
        styles: {
          configFile: "src/assets/styles/variables/settings.scss",
        },
      }),

      AutoImport({
        /* options */
        eslintrc: {
          enabled: true,
          filepath: "./.eslintrc-auto-import.json",
        },
        imports: [
          "vue",
          VueRouterAutoImports,
          "@vueuse/core",
          {
            // add any other imports you were relying on
            "vue-router/auto": ["useLink"],
          },
          "pinia",
          "vue-i18n",
        ],
        dirs: [
          "./src/utils",
          "./src/api",
          "./src/plugins/2.pinia/modules",
          "./src/navigations",
        ],
        vueTemplate: true,
        // ℹ️ Disabled to avoid confusion & accidental usage
        ignore: ["useCookies", "useStorage"],
      }),

      Layouts({
        layoutsDirs: "./src/layouts",
        defaultLayout: "default",
        exclude: ["**/components/*.vue", "**/stores"],
      }),

      Components({
        dirs: ["./src/views", "./src/components"],
        dts: true,
        // resolvers: [Vuetify3Resolver()],
        types: [
          {
            from: "vue-router",
            names: ["RouterLink", "RouterView"],
          },
        ],
      }),

      // Docs: https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n#intlifyunplugin-vue-i18n
      VueI18nPlugin({
        runtimeOnly: true,
        compositionOnly: true,
        include: [
          fileURLToPath(
            new URL("./src/plugins/i18n/locales/**", import.meta.url)
          ),
        ],
      }),

      compression({ algorithm: "brotliCompress" }),
    ],

    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },

    build: {
      chunkSizeWarningLimit: 5000,
      // target: 'esnext',
      // minify: mode === "staging" ? false : "esbuild",
      // sourcemap: mode === "staging",
      minify: "esbuild",
      sourcemap: true,
      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.code === "ANNOTATION") return;
          warn(warning);
        },

        output: {
          manualChunks: {
            vuetify: ["vuetify/components", "vuetify/directives", "vuetify"],
          },
          plugins: [],
        },
      },

      cssCodeSplit: true,
      brotliSize: true,
    },

    define: {
      __DEV__: mode === "staging" ? true : false,
    },

    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@themeConfig": fileURLToPath(
          new URL("./themeConfig.js", import.meta.url)
        ),
        "@layouts": fileURLToPath(new URL("./src/layouts", import.meta.url)),
        "@images": fileURLToPath(
          new URL("./src/assets/images/", import.meta.url)
        ),
        "@sounds": fileURLToPath(
          new URL("./src/assets/sounds/", import.meta.url)
        ),
        "@styles": fileURLToPath(
          new URL("./src/assets/styles/", import.meta.url)
        ),
        "@store": fileURLToPath(
          new URL("./src/plugins/2.pinia/", import.meta.url)
        ),
        "@api": fileURLToPath(new URL("./src/api/", import.meta.url)),
        "@plugins": fileURLToPath(new URL("./src/plugins", import.meta.url)),
        "@utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
      },
    },

    optimizeDeps: {
      exclude: ["vuetify", "@telegram-apps/sdk"],
      entries: ["./src/**/*.vue"],
    },

    server: {
      host: true,
    },
  };
});
