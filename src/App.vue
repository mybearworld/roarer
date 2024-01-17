<script setup lang="ts">
import { RouterView } from "vue-router";
import Login from "./components/Login.vue";
import Navigation from "./components/Navigation.vue";
import { useLoginStatusStore } from "./stores/loginStatus";

const loginStatusStore = useLoginStatusStore();
</script>

<template>
  <Login v-if="!loginStatusStore.username" />
  <div class="space-y-2" v-else>
    <Navigation />
    <RouterView />
  </div>
</template>
