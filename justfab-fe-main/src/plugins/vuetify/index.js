import "vuetify/styles";

import { deepMerge } from "@antfu/utils";
import { createVuetify } from "vuetify";
import { VBtn } from "vuetify/components/VBtn";
import { createVueI18nAdapter } from "vuetify/locale/adapters/vue-i18n";
import defaults from "./defaults";
import { icons } from "./icons";
import { useI18n } from "vue-i18n";
import { getI18n } from "@plugins/i18n/index";
import { staticPrimaryColor, staticPrimaryDarkenColor, themes } from "./theme";

// Styles
import { cookieRef } from "@utils/layouts/config";

export default function (app) {
  const cookieThemeValues = {
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          primary: cookieRef("lightThemePrimaryColor", staticPrimaryColor)
            .value,
          "primary-darken-1": cookieRef(
            "lightThemePrimaryDarkenColor",
            staticPrimaryDarkenColor
          ).value,
        },
      },
      dark: {
        colors: {
          primary: cookieRef("darkThemePrimaryColor", staticPrimaryColor).value,
          "primary-darken-1": cookieRef(
            "darkThemePrimaryDarkenColor",
            staticPrimaryDarkenColor
          ).value,
        },
      },
    },
  };

  const optionTheme = deepMerge({ themes }, cookieThemeValues);

  const vuetify = createVuetify({
    aliases: {
      IconBtn: VBtn,
    },
    defaults,
    icons,
    theme: optionTheme,
    locale: {
      adapter: createVueI18nAdapter({ i18n: getI18n(), useI18n }),
    },
  });

  app.use(vuetify);
}
