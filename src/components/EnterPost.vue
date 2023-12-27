<script setup lang="ts">
import { ref } from "vue";
import { z } from "zod";
import { postSchema } from "../lib/postSchema";
import { useCloudlinkStore } from "../stores/cloudlink";
import { useLoginStatusStore } from "../stores/loginStatus";

const cloudlinkStore = useCloudlinkStore();
const loginStatusStore = useLoginStatusStore();

const postContent = ref("");
const errorMessage = ref("");

const post = async (e: Event) => {
  e.preventDefault();
  const username = loginStatusStore.username;
  if (username === null) {
    throw new Error("Not logged in");
  }
  try {
    await cloudlinkStore.send(
      {
        cmd: "post_home",
        val: postContent.value,
      },
      postSchema.and(z.object({ u: z.literal(username) })),
    );
  } catch (e) {
    errorMessage.value = e as string;
  }
  postContent.value = "";
};
</script>

<template>
  <form v-on:submit="post">
    <input placeholder="Say something!" v-model="postContent" />
    <button type="submit">Send!</button>
  </form>
  <p v-if="errorMessage">{{ errorMessage }}</p>
</template>
