<script setup lang="ts">
import { effect } from "vue";
import { useRoute, RouterView } from "vue-router";
import DMToasts from "./components/DMToasts.vue";
import Login from "./components/Login.vue";
import Navigation from "./components/Navigation.vue";
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
  <Login v-if="!loginStatusStore.username" />
  <div class="space-y-2" v-else>
    <Navigation v-if="!('noLayout' in route.meta)" />
    <RouterView />
    <DMToasts v-if="!('noLayout' in route.meta)" />
  </div>
</template>
