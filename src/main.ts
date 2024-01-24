import { createApp } from "vue";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import { createRouter, createWebHashHistory } from "vue-router";
import App from "./App.vue";
import Chat from "./components/locations/Chat.vue";
import ChatSettings from "./components/locations/ChatSettings.vue";
import Groups from "./components/locations/Groups.vue";
import Home from "./components/locations/Home.vue";
import Inbox from "./components/locations/Inbox.vue";
import NotFound from "./components/locations/NotFound.vue";
import Settings from "./components/locations/Settings.vue";
import ThemeSettings from "./components/locations/ThemeSettings.vue";
import Users from "./components/locations/Users.vue";
import "./style.css";
import { languages } from "./i18n/languages";

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem("roarer:locale") || "en",
  fallbackLocale: "en",
  messages: languages,
});
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", redirect: "/home" },
    { path: "/home", component: Home },
    { path: "/chats", component: Groups },
    { path: "/chats/:id", component: Chat },
    { path: "/chats/:id/settings", component: ChatSettings },
    { path: "/inbox", component: Inbox },
    { path: "/settings", component: Settings },
    { path: "/settings/theme", component: ThemeSettings },
    { path: "/users", component: Users },
    { path: "/users/:username", component: Users },
    { path: "/users/:username/dm", component: Chat },
    { path: "/:path(.*)", component: NotFound },
  ],
});

createApp(App).use(createPinia()).use(i18n).use(router).mount("#app");
