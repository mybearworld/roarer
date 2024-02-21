<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useCloudlinkStore } from "../../stores/cloudlink";
import { useLoginStatusStore } from "../../stores/loginStatus";
import { useRelationshipStore } from "../../stores/relationship";
import { loginSchema } from "../../lib/loginSchema";

const cloudlinkStore = useCloudlinkStore();
const loginStatusStore = useLoginStatusStore();
const relationshipStore = useRelationshipStore();
const { t } = useI18n();
const router = useRouter();

const username = ref("");
const password = ref("");
const loading = ref(false);
const message = ref("");

const resetFormFields = () => {
  username.value = "";
  password.value = "";
};

const loginEvent = async (e: Event) => {
  e.preventDefault();
  loading.value = true;
  message.value = "";
  let data;
  try {
    data = await cloudlinkStore.login(username.value, password.value);
  } catch (e) {
    message.value = e as string;
    loading.value = false;
    return;
  }
  loginStatusStore.username = data.payload.username;
  loginStatusStore.token = data.payload.token;
  loading.value = false;
  resetFormFields();
  router.push("/home");
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
      loginSchema,
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
</script>

<template>
  <div class="flex justify-center">
    <form :class="`rounded-xl px-5 py-4`" v-on:submit="loginEvent">
      <div class="space-y-4">
        <div class="flex gap-2">
          <strong class="text-xl">{{ t("loginHeader") }} </strong>
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
