import { createApp } from "vue";
import "./style.css";
import router from "./router";
import i18n from "./i18n";
import App from "./App";

const app = createApp(App);
app.use(i18n);
app.use(router);
app.mount("#app");
