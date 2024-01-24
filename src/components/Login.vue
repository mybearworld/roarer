<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { z } from "zod";
import LanguageSwitcher from "./LanguageSwitcher.vue";
import { useCloudlinkStore } from "../stores/cloudlink";
import { useLoginStatusStore } from "../stores/loginStatus";
import { useRelationshipStore } from "../stores/relationship";
import { useSettingsStore } from "../stores/settings";
import { individualRelationshipPacketSchema } from "../lib/relationshipSchema";

const cloudlinkStore = useCloudlinkStore();
const loginStatusStore = useLoginStatusStore();
const relationshipStore = useRelationshipStore();
const settingsStore = useSettingsStore();
const { t } = useI18n();

const logInSchema = z.object({
  mode: z.literal("auth"),
  payload: z.object({
    username: z.string(),
    token: z.string(),
    relationships: individualRelationshipPacketSchema.array(),
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
  relationshipStore.blockedUsers = new Set(
    response.payload.relationships
      .filter((relationship) => relationship.state === 2)
      .map((relationship) => relationship.username),
  );
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

const signUp = async () => {
  loading.value = true;
  message.value = "";
  let data;
  try {
    data = await cloudlinkStore.send(
      {
        cmd: "gen_account",
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
  loginStatusStore.token = data.payload.token;
  loading.value = false;
  resetFormFields();
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
      try {
        await login(...nonNullCredentials);
      } catch (e) {
        if (!confirm(t("loginFail"))) {
          loginStatusStore.username = null;
          loginStatusStore.token = null;
        }
        location.reload();
      }
    }
  });
}

const signOut = async () => {
  if (!confirm(t("loginSignoutConfirm"))) {
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
      class="absolute left-0 top-0 flex h-screen w-screen items-center justify-center"
    >
      <form :class="`rounded-xl px-5 py-4`" v-on:submit="loginEvent">
        <div class="space-y-4">
          <div class="flex gap-2">
            <strong class="text-xl">{{ t("loginHeader") }} </strong>
            <LanguageSwitcher />
          </div>
          <label class="block">
            {{ t("loginUsername") }}
            <input
              class="rounded-lg border-2 border-accent bg-transparent px-1"
              type="text"
              v-model="username"
            />
          </label>
          <label class="block">
            {{ t("loginPassword") }}
            <input
              class="rounded-lg border-2 border-accent bg-transparent px-1"
              type="password"
              v-model="password"
            />
          </label>
          <div class="space-x-2">
            <button
              class="rounded-xl bg-accent px-2 py-1 text-accent-text"
              type="submit"
              :disabled="loading"
            >
              {{ t("loginSubmit") }}
            </button>
            <button
              class="rounded-xl bg-accent px-2 py-1 text-accent-text"
              type="button"
              :disabled="loading"
              @click="signUp"
            >
              {{ t("loginSignUp") }}
            </button>
          </div>
          <span v-if="message">
            {{ message }}
          </span>
        </div>
      </form>
    </div>
  </template>
  <div class="inline-flex flex-col" v-else>
    <button
      class="inline-block rounded-xl bg-accent px-2 py-1 text-sm text-accent-text"
      v-on:click="signOut"
    >
      {{ t("signOut") }}
      <div class="text-xs font-bold">@{{ loginStatusStore.username }}</div>
    </button>
  </div>
</template>
