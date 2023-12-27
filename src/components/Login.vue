<script setup lang="ts">
import { ref } from "vue";
import { useCloudlinkStore } from "../stores/cloudlink";

const cloudlinkStore = useCloudlinkStore();

const username = ref("");
const password = ref("");

const login = (e: Event) => {
  e.preventDefault();
  cloudlinkStore.login(username.value, password.value);
};
</script>

<template>
  <form v-on:submit="login">
    <strong class="block">Log in</strong>
    <label class="block">
      Username:
      <input type="text" v-model="username" />
    </label>
    <label class="block">
      Password:
      <input type="password" v-model="password" />
    </label>
    <button type="submit">Submit</button>
  </form>
</template>
