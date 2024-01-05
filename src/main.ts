import { createApp } from "vue";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import App from "./App.vue";
import "./style.css";
import { languages } from "./i18n/languages";

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem("roarer:locale") || "en",
  fallbackLocale: "en",
  messages: languages,
});

createApp(App).use(createPinia()).use(i18n).mount("#app");
