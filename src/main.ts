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
import Livechat from "./components/locations/Livechat.vue";
import Login from "./components/locations/Login.vue";
import NotFound from "./components/locations/NotFound.vue";
import PostShare from "./components/locations/PostShare.vue";
import RoarBot from "./components/locations/RoarBot.vue";
import ReportHistory from "./components/locations/ReportHistory.vue";
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
    { path: "/login", component: Login },
    { path: "/home", component: Home },
    { path: "/chats", component: Groups, meta: { requiresLogin: true } },
    {
      path: "/chats/:id",
      component: Chat,
      meta: { isChat: true, requiresLogin: true },
    },
    {
      path: "/chats/livechat",
      component: Livechat,
    },
    {
      path: "/chats/:id/settings",
      component: ChatSettings,
      meta: { requiresLogin: true },
    },
    { path: "/inbox", component: Inbox, meta: { requiresLogin: true } },
    { path: "/settings", component: Settings },
    { path: "/settings/theme", component: ThemeSettings },
    {
      path: "/settings/reportHistory",
      component: ReportHistory,
      meta: { requiresLogin: true },
    },
    { path: "/users", component: Users },
    { path: "/users/:username", component: Users },
    {
      path: "/users/:username/dm",
      component: Chat,
      meta: { requiresLogin: true },
    },
    { path: "/posts/:post", component: PostShare },
    { path: "/bot", component: RoarBot },
    { path: "/:path(.*)", component: NotFound },
  ],
});

createApp(App).use(createPinia()).use(i18n).use(router).mount("#app");
