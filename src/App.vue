<script setup lang="ts">
import { effect } from "vue";
import { useRoute, RouterView } from "vue-router";
import DMToasts from "./components/DMToasts.vue";
import Navigation from "./components/Navigation.vue";
import LoginRequired from "./components/locations/LoginRequired.vue";
import { useLoginStatusStore } from "./stores/loginStatus";
import { useSettingsStore, themeVariables } from "./stores/settings";

const loginStatusStore = useLoginStatusStore();
const settingsStore = useSettingsStore();
const route = useRoute();

effect(() => {
  themeVariables.forEach(([key, name]) => {
    document.documentElement.style.setProperty(name, settingsStore.theme[key]);
  });
});
</script>

<template>
  <div class="flex flex-col gap-2">
    <Navigation />
    <LoginRequired
      v-if="!loginStatusStore.isLoggedIn && 'requiresLogin' in route.meta"
    />
    <RouterView v-else />
    <DMToasts />
  </div>
</template>
