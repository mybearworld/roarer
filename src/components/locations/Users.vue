<script lang="ts" setup>
import { computed, effect, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import { profilePictures } from "../../assets/pfp";
import meowy from "../../assets/pfp/22.svg";
import { apiRequest, getResponseFromAPIRequest } from "../../lib/apiRequest";
import { formatDate } from "../../lib/formatDate";
import { getPermissions } from "../../lib/permissions";
import { profileSchemaOrError, APIProfile } from "../../lib/profileSchema";
import { useLoginStatusStore } from "../../stores/loginStatus";
import { useOnlinelistStore } from "../../stores/onlinelist";
import { useRelationshipStore } from "../../stores/relationship";

const loginStatusStore = useLoginStatusStore();
const onlinelistStore = useOnlinelistStore();
const relationshipStore = useRelationshipStore();
const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();

const username = ref("");

const submit = (e: Event) => {
  e.preventDefault();
  if (!username.value) {
    return;
  }
  router.push(`/users/${username.value}`);
};

const profilePicture = computed(() =>
  userProfile.value
    ? profilePictures.get(userProfile.value.pfp_data)
    : undefined,
);

const userProfile = ref<APIProfile | null>(null);
effect(async () => {
  if (!route.params.username) {
    return;
  }
  const response = await getResponseFromAPIRequest(
    `/users/${route.params.username}`,
    {
      schema: profileSchemaOrError,
    },
  );
  if ("status" in response) {
    alert(t("profileInformationFail", { status: response.status }));
    return;
  }
  if (response.error) {
    alert(t("profileInformationFail", { status: response.type }));
    return;
  }
  userProfile.value = response;
});

const isBlocked = computed(() =>
  relationshipStore.blockedUsers.has(username.value),
);
const block = async () => {
  if (!route.params.username) {
    return;
  }
  if (
    !confirm(t(isBlocked.value ? "unblockUserConfirm" : "blockUserConfirm"))
  ) {
    return;
  }
  const response = await apiRequest(
    `/users/${route.params.username}/relationship`,
    {
      method: "PATCH",
      auth: loginStatusStore,
      body: JSON.stringify({
        state: isBlocked.value ? 0 : 2,
      }),
    },
  );
  if (response.status !== 200) {
    alert(
      t(isBlocked.value ? "blockFail" : "unblockFail", {
        status: response.status,
      }),
    );
  }
};

const permissions = computed(() =>
  userProfile.value?.permissions
    ? getPermissions(userProfile.value?.permissions)
    : null,
);
</script>

<template>
  <div class="flex flex-col gap-2">
    <form class="flex gap-2" @submit="submit">
      <input
        class="w-full rounded-lg border-2 border-accent bg-transparent px-2 py-1"
        :placeholder="t('username')"
        type="text"
        v-model="username"
      />
      <button class="text-nowrap rounded-xl bg-accent px-2 py-1">
        {{ t("userSearch") }}
      </button>
    </form>
    <div
      class="opacity-400 mt-5 text-center text-xl italic"
      v-if="userProfile === null"
    >
      {{ t("noUserPlaceholder") }}
    </div>
    <div class="mx-auto mt-5 flex gap-2" v-else>
      <div
        class="flex min-w-[calc(70px+theme(spacing.4))] items-center rounded-xl border-2 border-text bg-white p-2"
      >
        <img
          width="70"
          height="70"
          :src="profilePicture"
          v-if="profilePicture"
        />
        <img
          width="70"
          height="70"
          :src="meowy"
          class="brightness-150 grayscale motion-safe:animate-spin motion-safe:[animation-duration:.5s]"
          v-else
        />
      </div>
      <div class="">
        <h2 class="text-xl font-bold">{{ userProfile._id }}</h2>
        <q class="text-lg italic" v-if="userProfile.quote">
          {{ userProfile.quote }}
        </q>
        <div class="mt-2"></div>
        <p
          v-if="
            typeof route.params.username === 'string' &&
            onlinelistStore.online.includes(route.params.username)
          "
        >
          {{ t("online") }}
        </p>
        <p v-else-if="userProfile.last_seen">
          {{
            t("lastSeenUser", {
              date: formatDate(userProfile!.last_seen, locale),
            })
          }}
        </p>
        <p v-if="userProfile.banned">{{ t("banned") }}</p>
        <div class="mt-2"></div>
        <p>
          {{
            t("accountCreated", {
              date: formatDate(userProfile.created, locale),
            })
          }}
        </p>
        <ul class="mt-2" v-if="permissions && permissions.length">
          <li v-for="permission in permissions">
            {{ t(permission) }}
          </li>
        </ul>
        <div class="mt-2"></div>
        <div class="space-x-2">
          <RouterLink
            :to="`/users/${userProfile._id}/dm`"
            class="rounded-xl bg-accent px-2 py-1 text-accent-text"
            v-if="!isBlocked && loginStatusStore.username !== userProfile._id"
          >
            {{ t("chatDM") }}
          </RouterLink>
          <button
            type="button"
            class="rounded-xl bg-accent px-2 py-1 text-accent-text"
            @click="block"
            v-if="route.params.username !== loginStatusStore.username"
          >
            {{ t(isBlocked ? "unblock" : "block") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
