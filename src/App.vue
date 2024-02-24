<script setup lang="ts">
import { effect } from "vue";
import { useRoute, RouterView } from "vue-router";
import DMToasts from "./components/DMToasts.vue";
import Navigation from "./components/Navigation.vue";
import Login from "./components/locations/Login.vue";
import { useAuthStore } from "./stores/auth";
import { useSettingsStore, themeVariables } from "./stores/settings";

const authStore = useAuthStore();
const settingsStore = useSettingsStore();
const route = useRoute();

effect(() => {
  themeVariables.forEach(([key, name]) => {
    document.documentElement.style.setProperty(name, settingsStore.theme[key]);
  });
  document.documentElement.classList.remove(
    "post-style-filled",
    "post-style-bordered",
  );
  document.documentElement.classList.add(
    `post-style-${settingsStore.theme.roarer_postStyle}`,
  );
});
</script>

<template>
  <div class="flex flex-col gap-2">
    <Navigation />
    <div class="filled:block z hidden">Filled</div>
    <div class="bordered:block z hidden">Bordered</div>
    <Login v-if="!authStore.isLoggedIn && 'requiresLogin' in route.meta" />
    <RouterView v-else />
    <DMToasts />
  </div>
</template>
./stores/auth
