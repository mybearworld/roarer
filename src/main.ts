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
import ReportHistory from "./components/locations/ReportHistory.vue";
import Settings from "./components/locations/Settings.vue";
import Syntax from "./components/locations/Syntax.vue";
import ThemeSettings from "./components/locations/ThemeSettings.vue";
import Users from "./components/locations/Users.vue";
import "./style.css";
import { languages } from "./i18n/languages";

const tw = <T>(n: T) => n;

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
    { path: "/login", component: Login, meta: { tab: null } },
    { path: "/home", component: Home, meta: { tab: "routeHome" } },
    {
      path: "/chats",
      component: Groups,
      meta: { requiresLogin: true, tab: "routeGroups" },
    },
    {
      path: "/chats/:id",
      component: Chat,
      meta: { isChat: true, requiresLogin: true, tab: "routeGroups" },
    },
    {
      path: "/chats/livechat",
      component: Livechat,
      meta: { tab: "routeGroups" },
    },
    {
      path: "/chats/:id/settings",
      component: ChatSettings,
      meta: { requiresLogin: true, tab: "routeGroups" },
    },
    {
      path: "/inbox",
      component: Inbox,
      meta: { requiresLogin: true, tab: "routeInbox" },
    },
    { path: "/settings", component: Settings, meta: { tab: "routeSettings" } },
    {
      path: "/settings/theme",
      component: ThemeSettings,
      meta: { tab: "routeSettings" },
    },
    {
      path: "/settings/reportHistory",
      component: ReportHistory,
      meta: { requiresLogin: true, tab: "routeSettings" },
    },
    { path: "/users", component: Users, meta: { tab: "routeUsers" } },
    { path: "/users/:username", component: Users, meta: { tab: "routeUsers" } },
    {
      path: "/users/:username/dm",
      component: Chat,
      meta: { requiresLogin: true, tab: "routeGroups" },
    },
    { path: "/posts/:post", component: PostShare, meta: { tab: null } },
    { path: "/syntax", component: Syntax, meta: { tab: null } },
    { path: "/:path(.*)", component: NotFound, meta: { tab: null } },
  ],
});

createApp(App).use(createPinia()).use(i18n).use(router).mount("#app");
