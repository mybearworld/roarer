<script setup lang="ts">
import { ref } from "vue";
import { z } from "zod";
import { useCloudlinkStore } from "../stores/cloudlink";

const cloudlinkStore = useCloudlinkStore();

const logInSchema = z
  .object({
    cmd: z.literal("statuscode"),
    val: z.string(),
  })
  .or(
    z.object({
      cmd: z.literal("direct"),
      val: z.object({
        mode: z.literal("auth"),
        payload: z.object({
          username: z.string(),
        }),
      }),
    }),
  );

const username = ref("");
const password = ref("");
const loading = ref(false);
const message = ref("");

const login = (e: Event) => {
  e.preventDefault();
  cloudlinkStore.login(username.value, password.value);
  loading.value = true;
  message.value = "";
  cloudlinkStore.lookFor(logInSchema, (packet) => {
    if (packet.cmd === "statuscode") {
      message.value = packet.val;
      loading.value = false;
      return;
    }
    message.value = `Logged in as ${packet.val.payload.username}`;
    loading.value = false;
    return;
  });
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
    <button type="submit" :disabled="loading">
      {{ loading ? "Loading..." : "Submit" }}
    </button>
    <p v-if="message">
      {{ message }}
    </p>
  </form>
</template>
