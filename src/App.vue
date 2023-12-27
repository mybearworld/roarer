<script setup lang="ts">
import { useLoginStatusStore } from "./stores/loginStatus";
import Login from "./components/Login.vue";
import HomePosts from "./components/HomePosts.vue";

const loginStatusStore = useLoginStatusStore();
</script>

<template>
  <h1>Roarer</h1>
  <Login />
  <HomePosts v-if="loginStatusStore.username !== null" />
</template>
