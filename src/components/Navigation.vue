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
    <div class="mb-2 flex flex-col items-center gap-1">
      <div class="flex flex-wrap gap-x-4">
        <h1 class="text-3xl font-bold">Roarer&nbsp;-&nbsp;{{ title }}</h1>
        <Login />
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button
          class="flex text-nowrap text-sky-400 underline"
          @click="goTo('home')"
        >
          {{ t("routeHome") }}
        </button>
        <button
          class="flex text-nowrap text-sky-400 underline"
          @click="goTo('inbox')"
        >
          {{ t("routeInbox") }}
        </button>
        <button
          class="flex text-nowrap text-sky-400 underline"
          @click="goTo('group')"
        >
          {{ t("routeGroups") }}
        </button>
        <button
          class="flex text-nowrap text-sky-400 underline"
          @click="goTo('users')"
        >
          {{ t("routeUsers") }}
        </button>
        <button
          class="flex text-nowrap text-sky-400 underline"
          @click="goTo('settings')"
        >
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
    <p>
      {{ t("contributed.start")
      }}<a
        href="https://github.com/mybearworld/roarer/issues/38"
        class="text-sky-400 underline"
        >{{ t("contributed.issueLink") }}</a
      >{{ t("contributed.end") }}
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
