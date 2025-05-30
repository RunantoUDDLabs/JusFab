/**
 * plugins/webfontloader.js
 *
 * webfontloader documentation: https://github.com/typekit/webfontloader
 */
import "@styles/fonts.css";

export async function loadFonts() {
  const webFontLoader = await import(
    /* webpackChunkName: "webfontloader" */ "webfontloader"
  );

  webFontLoader.load({
    google: {
      families: ["DynaPuff:700", "Arbutus:400"],
    },
    custom: {
      families: ["Montserrat"],
      // urls: ['./assets/fonts.css']
    },
  });
}

export default function () {
  loadFonts();
}
