<script setup lang="ts">
import { ref } from "vue";
import { z } from "zod";
import { useCloudlinkStore } from "../stores/cloudlink";
import { useLoginStatusStore } from "../stores/loginStatus";

const cloudlinkStore = useCloudlinkStore();
const loginStatusStore = useLoginStatusStore();

const logInSchema = z.object({
  mode: z.literal("auth"),
  payload: z.object({
    username: z.string(),
  }),
});

const username = ref("");
const password = ref("");
const loading = ref(false);
const message = ref("");

const resetFormFields = () => {
  username.value = "";
  password.value = "";
};

const login = async (e: Event) => {
  e.preventDefault();
  loading.value = true;
  message.value = "";
  let data;
  try {
    data = await cloudlinkStore.send(
      {
        cmd: "authpswd",
        val: { username: username.value, pswd: password.value },
      },
      logInSchema,
    );
  } catch (e) {
    message.value = e as string;
    loading.value = false;
    return;
  }
  loginStatusStore.username = data.payload.username;
  loading.value = false;
  resetFormFields();
  return;
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
