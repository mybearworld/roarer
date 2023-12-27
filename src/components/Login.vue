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
    token: z.string(),
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

const login = async (username: string, password: string, noErrors = false) => {
  return await cloudlinkStore.send(
    {
      cmd: "authpswd",
      val: { username: username, pswd: password },
    },
    logInSchema,
    !noErrors,
  );
};

const loginEvent = async (e: Event) => {
  e.preventDefault();
  loading.value = true;
  message.value = "";
  let data;
  try {
    data = await login(username.value, password.value);
  } catch (e) {
    message.value = e as string;
    loading.value = false;
    return;
  }
  loginStatusStore.username = data.payload.username;
  loginStatusStore.token = data.payload.token;
  loading.value = false;
  resetFormFields();
  return;
};

if (loginStatusStore.username !== null && loginStatusStore.token !== null) {
  let nonNullCredentials: [string, string] = [
    loginStatusStore.username,
    loginStatusStore.token,
  ];
  try {
    const syntaxErrorSchema = z.object({
      val: z.literal("E:101 | Syntax"),
    });
    cloudlinkStore.cloudlink.on("statuscode", async (packet: unknown) => {
      if (syntaxErrorSchema.safeParse(packet).success) {
        await login(...nonNullCredentials);
      }
    });
  } catch (e) {
    loginStatusStore.username = null;
    loginStatusStore.token = null;
    throw e;
  }
}

const signOut = () => {
  loginStatusStore.username = null;
  loginStatusStore.token = null;
};
</script>

<template>
  <template v-if="loginStatusStore.username === null">
    <div
      class="absolute left-0 top-0 -z-50 h-screen w-screen bg-black opacity-20"
    ></div>
    <div
      class="absolute left-0 top-0 flex h-screen w-screen items-center justify-center"
    >
      <form class="rounded-xl bg-slate-900 px-5 py-4" v-on:submit="loginEvent">
        <div class="space-y-4">
          <strong class="block text-xl">Log in to Roarer</strong>
          <label class="block">
            Username:
            <input
              class="rounded-lg bg-slate-700 px-1"
              type="text"
              v-model="username"
            />
          </label>
          <label class="block">
            Password:
            <input
              class="rounded-lg bg-slate-700 px-1"
              type="password"
              v-model="password"
            />
          </label>
          <button
            class="rounded-xl bg-slate-700 px-2 py-1"
            type="submit"
            :disabled="loading"
          >
            {{ loading ? "Loading..." : "Go!" }}
          </button>
          <span v-if="message">
            {{ message }}
          </span>
        </div>
      </form>
    </div>
  </template>
  <div class="float-right space-y-2 rounded-xl bg-slate-800 px-4 py-2" v-else>
    <button class="rounded-xl bg-slate-700 px-2 py-1" v-on:click="signOut">
      Sign out
    </button>
    <p>Logged in as {{ loginStatusStore.username }}</p>
  </div>
</template>
