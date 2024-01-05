<script setup lang="ts">
import Login from "./Login.vue";
import { useLocationStore, Location } from "../stores/location";
import { useIsDevStore } from "../stores/isDev";
import { useRelationshipStore } from "../stores/relationship";

const relationshipStore = useRelationshipStore();

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
        <button class="text-sky-400 underline" @click="goTo('home')">
          Home
        </button>
        <button class="text-sky-400 underline" @click="goTo('inbox')">
          Inbox
        </button>
        <button class="text-sky-400 underline" @click="goTo('group')">
          Groups
        </button>
        <button class="text-sky-400 underline" @click="goTo('users')">
          Users
        </button>
        <button class="text-sky-400 underline" @click="goTo('settings')">
          Settings
        </button>
        {{ relationshipStore.blockedUsers }}
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
