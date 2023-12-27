<script setup lang="ts">
import { ref } from "vue";
import { useCloudlinkStore } from "../stores/cloudlink";

const cloudlinkStore = useCloudlinkStore();

const postContent = ref("");

const post = (e: Event) => {
  e.preventDefault();
  alert(postContent.value);
  cloudlinkStore.post(postContent.value);
  postContent.value = "";
};
</script>

<template>
  <form v-on:submit="post">
    <input placeholder="Say something!" v-model="postContent" />
    <button type="submit">Send!</button>
  </form>
</template>
