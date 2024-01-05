<script setup lang="ts">
import { useI18n } from "vue-i18n";
import Login from "./Login.vue";
import { useLocationStore, Location } from "../stores/location";
import { useIsDevStore } from "../stores/isDev";

const { t } = useI18n();

const { title } = defineProps<{
  title: string;
}>();

document.title = "Roarer - " + title;

const isDevStore = useIsDevStore();
const locationStore = useLocationStore();

const goTo = (location: Location) => {
  locationStore.location = location;
  locationStore.sublocation = null;
};
</script>

<template>
  <div>
    <div class="relative flex gap-4">
      <h1 class="inline-block text-3xl font-bold">Roarer - {{ title }}</h1>
      <Login />
      <div class="absolute right-0 top-0 space-x-2">
        <button class="text-sky-400 underline" @click="goTo('home')">
          {{ t("routeHome") }}
        </button>
        <button class="text-sky-400 underline" @click="goTo('inbox')">
          {{ t("routeInbox") }}
        </button>
        <button class="text-sky-400 underline" @click="goTo('group')">
          {{ t("routeGroups") }}
        </button>
        <button class="text-sky-400 underline" @click="goTo('users')">
          {{ t("routeUsers") }}
        </button>
        <button class="text-sky-400 underline" @click="goTo('settings')">
          {{ t("routeSettings") }}
        </button>
      </div>
    </div>
    <p>
      {{ t("developmentStatus.start")
      }}<a
        href="https://github.com/mybearworld/roarer"
        class="text-sky-400 underline"
        >{{ t("developmentStatus.githubRepositoryLink") }}</a
      >{{ t("developmentStatus.end") }}
    </p>
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
</template>
