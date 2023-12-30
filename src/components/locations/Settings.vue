<script setup lang="ts">
import { ref } from "vue";
import { z } from "zod";
import Navigation from "../Navigation.vue";
import { profilePictures } from "../../assets/pfp";
import { profileSchema } from "../../lib/profileSchema";
import { useCloudlinkStore } from "../../stores/cloudlink";
import { useLoginStatusStore } from "../../stores/loginStatus";

const cloudlinkStore = useCloudlinkStore();
const loginStatusStore = useLoginStatusStore();

const quote = ref("");
const profilePicture = ref(0);

(async () => {
  const response = await (
    await fetch(`https://api.meower.org/users/${loginStatusStore.username}`)
  ).json();
  const parsedResponse = profileSchema.parse(response);
  quote.value = parsedResponse.quote;
  profilePicture.value = parsedResponse.pfp_data;
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

const submit = async (e: Event) => {
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
    alert(`Failed updating the config: ${e} `);
    return;
  }
  alert("Successfully updated your settings.");
};
</script>

<template>
  <div class="flex flex-col gap-2">
    <Navigation title="Settings" />
    <div>
      <h2 class="text-lg font-bold">Me</h2>
    </div>
    <form class="contents" @submit="submit">
      <label class="flex items-center gap-2">
        Quote:
        <input
          type="text"
          class="w-full rounded-lg bg-slate-800 px-2 py-1"
          v-model="quote"
        />
      </label>
      <label>
        Profile picture:
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
              :alt="`Profile picture #${key}`"
            />
          </button>
        </div>
      </label>
      <button class="rounded-xl bg-slate-700 px-2 py-1" type="submit">
        Submit
      </button>
    </form>
  </div>
</template>
