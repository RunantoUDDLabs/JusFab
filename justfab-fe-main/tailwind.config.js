export default {
  corePlugins: {
    preflight: false,
  },
  prefix: "tw-",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "rgba(var(--v-theme-primary),1)",
        activated: "rgba(var(--v-theme-activated),1)",
        "playtiful-primary-1": "rgba(var(--v-theme-playtiful-primary-1),1)",
      },
    },
  },

  plugins: [require("tailwindcss-animated")],
};
