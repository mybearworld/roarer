<script lang="ts" setup>
import { effect, ref } from "vue";
import Navigation from "../Navigation.vue";
import { profilePictures } from "../../assets/pfp";
import { formatDate } from "../../lib/formatDate";
import { profileSchemaOrError, APIProfile } from "../../lib/profileSchema";
import { useLocationStore } from "../../stores/location";
import { useLoginStatusStore } from "../../stores/loginStatus";
import { useOnlinelistStore } from "../../stores/onlinelist";

const locationStore = useLocationStore();
const loginStatusStore = useLoginStatusStore();
const onlinelistStore = useOnlinelistStore();

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
  const response = await (
    await fetch(`https://api.meower.org/users/${locationStore.sublocation}`)
  ).json();
  const parsedResponse = profileSchemaOrError.parse(response);
  if (parsedResponse.error) {
    alert(`Couldn't get profile: ${parsedResponse.type}`);
    return;
  }
  userProfile.value = parsedResponse;
});
</script>

<template>
  <div class="flex flex-col gap-2">
    <Navigation title="Users" />
    <form class="flex gap-2" @submit="submit">
      <input
        class="w-full rounded-lg bg-slate-800 px-2 py-1"
        placeholder="Username..."
        aria-label="Username"
        type="text"
        v-model="username"
      />
      <button class="rounded-xl bg-slate-800 px-2 py-1">Go</button>
    </form>
    <div
      class="mt-5 text-center text-xl italic text-slate-400"
      v-if="userProfile === null"
    >
      Enter a user above to view their profile!
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
          Online
        </p>
        <p v-else-if="userProfile.last_seen">
          Last seen {{ formatDate(userProfile!.last_seen) }}
        </p>
        <p v-if="userProfile.banned">Banned</p>
        <div class="mt-2"></div>
        <p>Account created: {{ formatDate(userProfile.created) }}</p>
        <div class="mt-2"></div>
        <button
          type="button"
          class="rounded-xl bg-slate-800 px-2 py-1"
          @click="dm(userProfile._id)"
        >
          DM
        </button>
      </div>
    </div>
  </div>
</template>
