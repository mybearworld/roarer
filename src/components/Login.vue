<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";
import { useLoginStatusStore } from "../stores/loginStatus";

const loginStatusStore = useLoginStatusStore();
const { t } = useI18n();

const signOut = async () => {
  if (!confirm(t("loginSignoutConfirm"))) {
    return;
  }
  loginStatusStore.username = null;
  loginStatusStore.token = null;
  location.reload();
};
</script>

<template>
  <button
    class="inline-block rounded-xl bg-accent px-2 py-1 text-sm text-accent-text"
    v-on:click="signOut"
    v-if="loginStatusStore.isLoggedIn"
  >
    {{ t("signOut") }}
    <div class="text-xs font-bold">@{{ loginStatusStore.username }}</div>
  </button>
  <RouterLink
    class="inline-block rounded-xl bg-accent px-2 py-1 text-sm text-accent-text"
    to="/login"
  >
    {{ t("logIn") }}
  </RouterLink>
</template>
