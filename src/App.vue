<script setup lang="ts">
import { effect } from "vue";
import { RouterView } from "vue-router";
import Login from "./components/Login.vue";
import Navigation from "./components/Navigation.vue";
import { useLoginStatusStore } from "./stores/loginStatus";
import { useSettingsStore, themeVariables } from "./stores/settings";

const loginStatusStore = useLoginStatusStore();
const settingsStore = useSettingsStore();
effect(() => {
  themeVariables.forEach(([key, name]) => {
    document.documentElement.style.setProperty(name, settingsStore.theme[key]);
  });
});
</script>

<template>
  <Login v-if="!loginStatusStore.username" />
  <div class="space-y-2" v-else>
    <Navigation />
    <RouterView />
  </div>
</template>
