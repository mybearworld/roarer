<script setup lang="ts">
import { useLoginStatusStore } from "./stores/loginStatus";
import { useLocationStore } from "./stores/location";
import Login from "./components/Login.vue";
import Home from "./components/locations/Home.vue";
import Inbox from "./components/locations/Inbox.vue";
import Groups from "./components/locations/Groups.vue";
import Settings from "./components/locations/Settings.vue";
import Users from "./components/locations/Users.vue";

const loginStatusStore = useLoginStatusStore();
const locationStore = useLocationStore();
</script>

<template>
  <template v-if="locationStore.location === 'home'">
    <Login v-if="loginStatusStore.username === null" />
    <Home v-else />
  </template>
  <Groups v-if="locationStore.location === 'group'" />
  <Inbox v-if="locationStore.location === 'inbox'" />
  <Settings v-if="locationStore.location === 'settings'" />
  <Users v-if="locationStore.location === 'users'" />
</template>
