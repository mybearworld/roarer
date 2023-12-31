<script setup lang="ts">
import Login from "./Login.vue";
import { useLocationStore, Location } from "../stores/location";
import { useIsDevStore } from "../stores/isDev";

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
    <div class="space-x-2">
      <h1 class="inline-block text-3xl font-bold">Roarer - {{ title }}</h1>
      <Login />
      <div class="float-right space-x-2">
        <button
          class="text-sky-400 underline"
          @click="locationStore.location = 'home'"
        >
          Home
        </button>
        <button
          class="text-sky-400 underline"
          @click="locationStore.location = 'inbox'"
        >
          Inbox
        </button>
        <button
          class="text-sky-400 underline"
          @click="locationStore.location = 'group'"
        >
          Groups
        </button>
        <button
          class="text-sky-400 underline"
          @click="locationStore.location = 'users'"
        >
          Users
        </button>
        <button
          class="text-sky-400 underline"
          @click="locationStore.location = 'settings'"
        >
          Settings
        </button>
      </div>
    </div>
    <p>
      Note: Roarer is very early in its development. Please do report bugs
      and/or suggest features on
      <a
        href="https://github.com/mybearworld/roarer"
        class="text-sky-400 underline"
        >the Github repository</a
      >!
    </p>
    <p class="text-red-200" v-if="isDevStore.isDev">
      You are currently in development mode.
    </p>
  </div>
</template>
