import { createApp } from "vue";
import App from "./App.vue";
import { registerPlugins } from "@utils/plugins";

// import "vuetify/styles";
import "@styles/tailwind.css";
import "@styles/styles.scss";

// Create vue app
const app = createApp(App);

// Register plugins
registerPlugins(app);

// Mount vue app
app.mount("#app");
