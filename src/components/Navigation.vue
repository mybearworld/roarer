<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";
import Login from "./Login.vue";
import { useIsDevStore } from "../stores/isDev";

const { t } = useI18n();

const isDevStore = useIsDevStore();
</script>

<template>
  <div>
    <div class="mb-2 flex flex-col items-center gap-1">
      <div class="flex flex-wrap items-center gap-x-4">
        <h1 class="text-3xl font-bold">
          {{ t("roarer") }}
        </h1>
        <Login />
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <RouterLink class="flex text-nowrap text-sky-400 underline" to="/">
          {{ t("routeHome") }}
        </RouterLink>
        <RouterLink class="flex text-nowrap text-sky-400 underline" to="/inbox">
          {{ t("routeInbox") }}
        </RouterLink>
        <RouterLink class="flex text-nowrap text-sky-400 underline" to="/chats">
          {{ t("routeGroups") }}
        </RouterLink>
        <RouterLink class="flex text-nowrap text-sky-400 underline" to="/users">
          {{ t("routeUsers") }}
        </RouterLink>
        <RouterLink
          class="flex text-nowrap text-sky-400 underline"
          to="/settings"
        >
          {{ t("routeSettings") }}
        </RouterLink>
      </div>
      <p class="text-red-200" v-if="isDevStore.isDev">
        {{ t("inDevelopmentMode") }}
        <a
          href="https://github.com/meower-media-co/Meower-Server/tree/main"
          class="text-sky-400 underline"
          target="_blank"
          >Meower Server</a
        >
        -
        <a
          href="https://github.com/meower-media-co/Meower-Svelte/tree/master"
          class="text-sky-400 underline"
          target="_blank"
          >Meower Svelte</a
        >
      </p>
    </div>
  </div>
</template>
