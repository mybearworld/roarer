<script setup lang="ts">
import { useLoginStatusStore } from "./stores/loginStatus";
import Login from "./components/Login.vue";
import HomePosts from "./components/HomePosts.vue";

const loginStatusStore = useLoginStatusStore();
</script>

<template>
  <Login v-if="loginStatusStore.username === null" />
  <HomePosts v-else />
</template>
