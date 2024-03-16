<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import { useCloudlinkStore } from "../../stores/cloudlink";
import { useAuthStore } from "../../stores/auth";
import { useRelationshipStore } from "../../stores/relationship";
import { loginSchema } from "../../lib/loginSchema";
import { effect } from "vue";

const cloudlinkStore = useCloudlinkStore();
const authStore = useAuthStore();
const relationshipStore = useRelationshipStore();
const { t } = useI18n();
const router = useRouter();
const route = useRoute();

effect(() => {
  if (authStore.isLoggedIn && route.path === "/login") {
    router.push("/home");
  }
});

const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const tosAgree = ref(false);
const signUpIssue = computed(() =>
  password.value !== confirmPassword.value
    ? "passwordMismatch"
    : !password.value
      ? "noPassword"
      : !username.value
        ? "noUsername"
        : !tosAgree.value
          ? "noTos"
          : null,
);
const loading = ref(false);
const message = ref("");
const mode = ref<"login" | "signup">("login");

const resetFormFields = () => {
  username.value = "";
  password.value = "";
};

const loginEvent = async (e: Event) => {
  e.preventDefault();
  if (mode.value === "signup") {
    signUp();
    return;
  }
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
  loading.value = false;
  resetFormFields();
};

const signUp = async () => {
  if (signUpIssue.value) {
    return;
  }
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
  authStore.username = data.payload.username;
  authStore.token = data.payload.token;
  location.reload();
};
</script>

<template>
  <div class="text-3xl font-bold">
    {{ t("loginRequiredHeader") }}
  </div>
  <p>{{ t("loginRequiredExplanation") }}</p>
  <p>{{ t("loginRequiredCta") }}</p>
  <p>
    {{ t("loginRequiredBack.start")
    }}<RouterLink to="/home" class="text-link underline">{{
      t("loginRequiredBack.link")
    }}</RouterLink
    >{{ t("loginRequiredBack.end") }}
  </p>
  <form :class="`rounded-xl`" @submit="loginEvent">
    <div class="space-y-4">
      <label class="flex w-56 flex-col">
        {{ t("loginUsername") }}
        <input
          class="rounded-lg border-2 border-accent bg-transparent px-1"
          type="text"
          required
          v-model="username"
        />
      </label>
      <label class="flex w-56 flex-col">
        {{ t("loginPassword") }}
        <input
          class="rounded-lg border-2 border-accent bg-transparent px-1"
          type="password"
          required
          v-model="password"
        />
      </label>
      <label class="flex w-56 flex-col" v-if="mode === 'signup'">
        <div>{{ t("loginConfirmPassword") }}</div>
        <input
          class="rounded-lg border-2 border-accent bg-transparent px-1"
          type="password"
          required
          v-model="confirmPassword"
        />
      </label>
      <label class="block space-x-2" v-if="mode === 'signup'">
        <input type="checkbox" v-model="tosAgree" />
        <span>
          {{ t("tosCheck.start")
          }}<a
            class="text-link underline"
            href="https://meower.org/legal"
            target="_blank"
            >{{ t("tosCheck.link") }}</a
          >{{ t("tosCheck.end") }}
        </span>
      </label>
      <div class="space-x-2">
        <button
          class="rounded-xl bg-accent px-2 py-1 text-accent-text disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          :disabled="loading || (mode === 'signup' && !!signUpIssue)"
        >
          {{ t(mode === "login" ? "loginSubmit" : "loginSignUp") }}
        </button>
        <button
          class="text-link underline"
          @click="mode = mode === 'login' ? 'signup' : 'login'"
          type="button"
        >
          {{ mode === "login" ? t("orSignUp") : t("orLogIn") }}
        </button>
        <span v-if="mode === 'signup' && signUpIssue">
          {{ t(`cantSignUp_${signUpIssue}`) }}
        </span>
      </div>
      <span v-if="message">
        {{ message }}
      </span>
    </div>
  </form>
</template>
