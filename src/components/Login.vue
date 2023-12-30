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

const login = async (username: string, password: string) => {
  const response = await cloudlinkStore.send(
    {
      cmd: "authpswd",
      val: { username: username, pswd: password },
    },
    logInSchema,
  );
  loginStatusStore.isLoggedIn = true;
  return response;
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

  const syntaxErrorSchema = z.object({
    val: z.literal("E:101 | Syntax"),
  });
  cloudlinkStore.cloudlink.on("statuscode", async (packet: unknown) => {
    if (loginStatusStore.isLoggedIn) {
      return;
    }
    if (syntaxErrorSchema.safeParse(packet).success) {
      const tryLogIn = async () => {
        try {
          await login(...nonNullCredentials);
        } catch (e) {
          if (
            confirm(
              "You couldn't be logged in. This may be because your token has been revoked. Do you want to try again?",
            )
          ) {
            tryLogIn();
          } else {
            loginStatusStore.username = null;
            loginStatusStore.token = null;
            location.reload();
          }
        }
      };
      tryLogIn();
    }
  });
}

const signOut = async () => {
  if (!confirm("Are you sure you want to sign out?")) {
    return;
  }
  loginStatusStore.username = null;
  loginStatusStore.token = null;
  location.reload();
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
  <div class="inline-flex items-center gap-2" v-else>
    <p class="inline-block">Logged in as {{ loginStatusStore.username }}</p>
    <button
      class="inline-block rounded-xl bg-slate-800 px-2 py-1"
      v-on:click="signOut"
    >
      Sign out
    </button>
  </div>
</template>
