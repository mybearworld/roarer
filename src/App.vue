<script setup lang="ts">
import { ref } from "vue";
import { useCloudlinkStore } from "./stores/cloudlink";
import Login from "./components/Login.vue";
</script>

<template>
  <h1>Roarer</h1>
  <Login />
</template>
