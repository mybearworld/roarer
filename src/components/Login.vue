<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useDialogStore } from "../stores/dialog"

const authStore = useAuthStore();
const dialogStore = useDialogStore();
const { t } = useI18n();

const signOut = async () => {
  if (!await dialogStore.confirm(t("loginSignoutConfirm"))) {
    return;
  }
  authStore.isLoggedIn = false;
  authStore.username = null;
  authStore.token = null;
  location.reload();
};
</script>

<template>
  <button
    class="inline-block rounded-xl bg-accent px-2 py-1 text-sm text-accent-text"
    v-on:click="signOut"
    v-if="authStore.isLoggedIn"
  >
    {{ t("signOut") }}
    <div class="text-xs font-bold">@{{ authStore.username }}</div>
  </button>
  <RouterLink
    class="inline-block rounded-xl bg-accent px-2 py-1 text-sm text-accent-text"
    to="/login"
    v-else
  >
    {{ t("logIn") }}
  </RouterLink>
</template>
