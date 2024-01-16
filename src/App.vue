<script setup lang="ts">
import { watch } from "vue";
import { RouterView } from "vue-router";
import { useI18n } from "vue-i18n";
import Login from "./components/Login.vue";
import Navigation from "./components/Navigation.vue";
import { useLoginStatusStore } from "./stores/loginStatus";

const loginStatusStore = useLoginStatusStore();
const { t, locale } = useI18n();

watch(
  [locale],
  () => {
    document.documentElement.className = t("_font");
  },
  { immediate: true },
);
</script>

<template>
  <Login v-if="!loginStatusStore.username" />
  <div class="space-y-2" v-else>
    <Navigation />
    <RouterView />
  </div>
</template>
