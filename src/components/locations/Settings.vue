<script setup lang="ts">
import { ref } from "vue";
import { z } from "zod";
import { useI18n } from "vue-i18n";
import Navigation from "../Navigation.vue";
import LanguageSwitcher from "../LanguageSwitcher.vue";
import { profilePictures } from "../../assets/pfp";
import { getResponseFromAPIRequest } from "../../lib/apiRequest";
import { profileSchema } from "../../lib/profileSchema";
import { useCloudlinkStore } from "../../stores/cloudlink";
import { useLocationStore } from "../../stores/location";
import { useLoginStatusStore } from "../../stores/loginStatus";

const cloudlinkStore = useCloudlinkStore();
const locationStore = useLocationStore();
const loginStatusStore = useLoginStatusStore();
const { t } = useI18n();

const quote = ref("");
const profilePicture = ref(0);

(async () => {
  const response = await getResponseFromAPIRequest(
    `/users/${loginStatusStore.username}`,
    {
      schema: profileSchema,
    },
  );
  if ("status" in response) {
    alert(t("profileInformationFail", { status: response.status }));
    return;
  }
  quote.value = response.quote;
  profilePicture.value = response.pfp_data;
})();

const updateConfigSchema = z.object({
  mode: z.literal("update_config"),
  payload: z.object({
    quote: z.string().optional(),
    pfp_data: z.number().optional(),
  }),
});
cloudlinkStore.lookFor(
  z.object({
    cmd: z.literal("direct"),
    val: updateConfigSchema,
  }),
  (packet) => {
    quote.value = packet.val.payload.quote ?? quote.value;
    profilePicture.value = packet.val.payload.pfp_data ?? profilePicture.value;
  },
  false,
);

const me = async (e: Event) => {
  e.preventDefault();
  try {
    await cloudlinkStore.send(
      {
        cmd: "update_config",
        val: {
          quote: quote.value,
          pfp_data: profilePicture.value,
        },
      },
      updateConfigSchema,
    );
  } catch (e) {
    alert(t("configFail", { errmsg: e }));
    return;
  }
  alert(t("configSuccess"));
};

const changePassword = async () => {
  const newPassword = prompt(t("newPassword"));
  if (!newPassword) {
    return;
  }
  const oldPassword = prompt(t("oldPassword"));
  if (!oldPassword) {
    return;
  }
  try {
    await cloudlinkStore.send(
      {
        cmd: "change_pswd",
        val: {
          old: oldPassword,
          new: newPassword,
        },
      },
      z.object({
        cmd: z.literal("statuscode"),
        val: z.literal("I:100 | OK"),
      }),
      false,
    );
  } catch (e) {
    alert(t("passwordChangeFail", { errmsg: e }));
    return;
  }
  if (confirm(t("alsoRevokeTokens"))) {
    revokeTokens();
  }
};

const revokeTokens = async () => {
  if (!confirm(t("revokeTokensConfirm"))) {
    return;
  }
  try {
    await cloudlinkStore.send(
      {
        cmd: "del_tokens",
        val: null,
      },
      z.literal("I:024 | Logged out"),
    );
  } catch (e) {
    alert(t("revokeTokensFail", { errmsg: e }));
    return;
  }
  loginStatusStore.username = null;
  loginStatusStore.token = null;
  location.reload();
};

const deleteAccount = async () => {
  if (!confirm(t("deleteAccountConfirm"))) {
    return;
  }
  const password = prompt(t("deleteAccountPassword"));
  if (!password) {
    return;
  }
  try {
    await cloudlinkStore.send(
      {
        cmd: "del_account",
        val: password,
      },
      z.literal("I:024 | Logged out"),
      // true,
    );
  } catch (e) {
    alert(t("deleteAccountFail", { errmsg: e }));
    return;
  }
  loginStatusStore.username = null;
  loginStatusStore.token = null;
  location.reload();
};
</script>

<template>
  <div class="flex flex-col gap-2">
    <Navigation :title="t('routeSettings')" />
    <div>
      <h2 class="text-lg font-bold">{{ t("usersSectionMe") }}</h2>
    </div>
    <form class="contents" @submit="me">
      <label class="flex items-center gap-2">
        {{ t("usersMeQuote") }}
        <input
          type="text"
          class="w-full rounded-lg bg-slate-800 px-2 py-1"
          v-model="quote"
        />
      </label>
      <label>
        {{ t("usersMePfp") }}
        <div class="flex flex-wrap gap-2">
          <button
            class="rounded-xl border-2 border-slate-500 bg-white p-2 aria-selected:outline aria-selected:outline-2 aria-selected:outline-green-500"
            :aria-selected="profilePicture === key"
            type="button"
            :title="`Profile picture #${key}`"
            @click="profilePicture = key"
            v-for="[key, value] of profilePictures"
          >
            <img
              width="70"
              height="70"
              :src="value"
              :alt="t('profilePictureAlt', { n: key })"
            />
          </button>
        </div>
      </label>
      <button class="rounded-xl bg-slate-800 px-2 py-1" type="submit">
        {{ t("updateProfile") }}
      </button>
    </form>
    <h2 class="text-lg font-bold">{{ t("myAccount") }}</h2>
    <div>
      <button class="rounded-xl bg-slate-800 px-2 py-1" @click="changePassword">
        {{ t("changePassword") }}
      </button>
    </div>
    <div>
      <button class="rounded-xl bg-slate-800 px-2 py-1" @click="revokeTokens">
        {{ t("revokeTokens") }}
      </button>
      {{ t("revokeTokensInfo") }}
    </div>
    <div>
      <button class="rounded-xl bg-slate-800 px-2 py-1" @click="deleteAccount">
        {{ t("deleteAccount") }}
      </button>
      {{ t("deleteAccountInfo") }}
    </div>
    <h2 class="text-lg font-bold">{{ t("language") }}</h2>
    <LanguageSwitcher />
    <p>
      {{ t("languageContributing.start")
      }}<a
        href="https://github.com/mybearworld/roarer/tree/main/src/i18n"
        class="text-sky-400 underline"
        >{{ t("languageContributing.githubLink") }}</a
      >{{ t("languageContributing.end") }}
    </p>
    <h2 class="text-lg font-bold">{{ t("credits") }}</h2>
    <p>
      {{ t("contributorsThanks.start")
      }}<a
        href="https://github.com/mybearworld/roarer/graphs/contributors"
        class="text-sky-400 underline"
        >{{ t("contributorsThanks.contributorsLink") }}</a
      >{{ t("contributorsThanks.end") }}
    </p>
    <p>
      {{ t("mascotThanks.start")
      }}<button
        class="text-sky-400 underline"
        @click="
          locationStore.location = 'users';
          locationStore.sublocation = 'Supernoodles99';
        "
      >
        @Supernoodles99</button
      >{{ t("mascotThanks.end") }}
    </p>
  </div>
</template>
