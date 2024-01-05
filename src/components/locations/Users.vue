<script lang="ts" setup>
import { computed, effect, ref } from "vue";
import Navigation from "../Navigation.vue";
import { useI18n } from "vue-i18n";
import { profilePictures } from "../../assets/pfp";
import { apiRequest, getResponseFromAPIRequest } from "../../lib/apiRequest";
import { formatDate } from "../../lib/formatDate";
import { profileSchemaOrError, APIProfile } from "../../lib/profileSchema";
import { useLocationStore } from "../../stores/location";
import { useLoginStatusStore } from "../../stores/loginStatus";
import { useOnlinelistStore } from "../../stores/onlinelist";
import { useRelationshipStore } from "../../stores/relationship";

const locationStore = useLocationStore();
const loginStatusStore = useLoginStatusStore();
const onlinelistStore = useOnlinelistStore();
const relationshipStore = useRelationshipStore();
const { t, locale } = useI18n();

const username = ref("");

const submit = (e: Event) => {
  e.preventDefault();
  if (!username.value) {
    return;
  }
  locationStore.sublocation = username.value;
};

const dm = (user: string) => {
  locationStore.location = "group";
  locationStore.sublocation = `dm:${user}`;
};

const userProfile = ref<APIProfile | null>(null);
effect(async () => {
  if (
    locationStore.sublocation === null ||
    locationStore.location !== "users"
  ) {
    return;
  }
  const response = await getResponseFromAPIRequest(
    `/users/${locationStore.sublocation}`,
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
  if (
    locationStore.sublocation === null ||
    locationStore.location !== "users"
  ) {
    return;
  }
  if (
    !confirm(t(isBlocked.value ? "unblockUserConfirm" : "blockUserConfirm"))
  ) {
    return;
  }
  const response = await apiRequest(
    `/users/${locationStore.sublocation}/relationship`,
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
</script>

<template>
  <div class="flex flex-col gap-2">
    <Navigation :title="t('routeUsers')" />
    <form class="flex gap-2" @submit="submit">
      <input
        class="w-full rounded-lg bg-slate-800 px-2 py-1"
        :placeholder="t('username')"
        type="text"
        v-model="username"
      />
      <button class="rounded-xl bg-slate-800 px-2 py-1">
        {{ t("userSearch") }}
      </button>
    </form>
    <div
      class="mt-5 text-center text-xl italic text-slate-400"
      v-if="userProfile === null"
    >
      {{ t("noUserPlaceholder") }}
    </div>
    <div class="mx-auto mt-5 flex gap-2" v-else>
      <div
        class="flex items-center rounded-xl border-2 border-slate-500 bg-white p-2"
      >
        <img
          width="70"
          height="70"
          :src="profilePictures.get(userProfile.pfp_data)"
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
            locationStore.sublocation &&
            onlinelistStore.online.includes(locationStore.sublocation)
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
        <div class="mt-2"></div>
        <div class="space-x-2">
          <button
            type="button"
            class="rounded-xl bg-slate-800 px-2 py-1"
            @click="dm(userProfile._id)"
            v-if="!isBlocked"
          >
            {{ t("chatDM") }}
          </button>
          <button
            type="button"
            class="rounded-xl bg-slate-800 px-2 py-1"
            @click="block"
            v-if="locationStore.sublocation !== loginStatusStore.username"
          >
            {{ t(isBlocked ? "unblock" : "block") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
