<script setup lang="ts">
import { ref } from "vue";
import { z } from "zod";
import { useCloudlinkStore } from "../stores/cloudlink";
import { useLoginStatusStore } from "../stores/loginStatus";

const cloudlinkStore = useCloudlinkStore();
const loginStatusStore = useLoginStatusStore();

const logInSchema = z
  .object({
    cmd: z.literal("statuscode"),
    val: z
      .literal("E:103 | ID not found")
      .or(z.literal("E:025 | Deleted"))
      .or(z.literal("I:011 | Invalid Password"))
      .or(z.literal("E:018 | Account Banned"))
      .or(z.literal("E:019 | Illegal characters detected"))
      .or(z.literal("E:106 | Too many requests")),
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

const resetFormFields = () => {
  username.value = "";
  password.value = "";
};

const login = (e: Event) => {
  e.preventDefault();
  cloudlinkStore.lookFor(logInSchema, (packet) => {
    if (packet.cmd === "statuscode") {
      message.value = packet.val;
      loading.value = false;
      return;
    }
    loginStatusStore.username = packet.val.payload.username;
    loading.value = false;
    resetFormFields();
    return;
  });
  cloudlinkStore.login(username.value, password.value);
  loading.value = true;
  message.value = "";
};

const signOut = () => {
  location.reload();
};
</script>

<template>
  <form v-on:submit="login">
    <template v-if="loginStatusStore.username !== null">
      <button v-on:click="signOut">Sign out</button>
      <p>Logged in as {{ loginStatusStore.username }}</p>
    </template>
    <template v-else>
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
    </template>
  </form>
</template>
