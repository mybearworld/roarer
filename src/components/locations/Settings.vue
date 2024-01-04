<script setup lang="ts">
import { ref } from "vue";
import { z } from "zod";
import Navigation from "../Navigation.vue";
import { profilePictures } from "../../assets/pfp";
import { getResponseFromAPIRequest } from "../../lib/apiRequest";
import { profileSchema } from "../../lib/profileSchema";
import { useCloudlinkStore } from "../../stores/cloudlink";
import { useLocationStore } from "../../stores/location";
import { useLoginStatusStore } from "../../stores/loginStatus";

const cloudlinkStore = useCloudlinkStore();
const locationStore = useLocationStore();
const loginStatusStore = useLoginStatusStore();

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
    alert(`Failed to get your profile information: ${response.status}`);
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
    alert(`Failed updating the config: ${e} `);
    return;
  }
  alert("Successfully updated your settings.");
};

const changePassword = async () => {
  const newPassword = prompt("What do you want your new password to be?");
  if (!newPassword) {
    return;
  }
  const oldPassword = prompt("What is your current password?");
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
    alert(`Couldn't change password: ${e}`);
    return;
  }
  if (confirm("Do you also want to revoke all tokens?")) {
    revokeTokens();
  }
};

const revokeTokens = async () => {
  if (!confirm("Are you sure? You'll have to sign in on every device again.")) {
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
    alert(`Couldn't revoke tokens: ${e}`);
    return;
  }
  loginStatusStore.username = null;
  loginStatusStore.token = null;
  location.reload();
};

const deleteAccount = async () => {
  if (
    !confirm(
      "Are you sure? There is ABSOLUTELY NO WAY to undo this. Your account will be PERMANENTLY deleted after 7 days.",
    )
  ) {
    return;
  }
  const password = prompt(
    "Please enter your password to confirm deleting your account.",
  );
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
    alert(`Couldn't delete account: ${e}`);
    return;
  }
  loginStatusStore.username = null;
  loginStatusStore.token = null;
  location.reload();
};
</script>

<template>
  <div class="flex flex-col gap-2">
    <Navigation title="Settings" />
    <div>
      <h2 class="text-lg font-bold">Me</h2>
    </div>
    <form class="contents" @submit="me">
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
      <button class="rounded-xl bg-slate-800 px-2 py-1" type="submit">
        Submit
      </button>
    </form>
    <h2 class="text-lg font-bold">My account</h2>
    <div>
      <button class="rounded-xl bg-slate-800 px-2 py-1" @click="changePassword">
        Change password
      </button>
    </div>
    <div>
      <button class="rounded-xl bg-slate-800 px-2 py-1" @click="revokeTokens">
        Revoke all tokens
      </button>
      This will sign you out of all devices.
    </div>
    <div>
      <button class="rounded-xl bg-slate-800 px-2 py-1" @click="deleteAccount">
        Delete account
      </button>
      This will delete your account <strong>permanently</strong>. There is
      <strong>no</strong> way to undo this.
    </div>
    <h2 class="text-lg font-bold">Credits</h2>
    <p>
      Thank you to all
      <a
        href="https://github.com/mybearworld/roarer/graphs/contributors"
        class="text-sky-400 underline"
        >contributors</a
      >
      for making this possible.
    </p>
    <p>
      Special thanks to
      <button
        class="text-sky-400 underline"
        @click="
          locationStore.location = 'users';
          locationStore.sublocation = 'Supernoodles99';
        "
      >
        @Supernoodles99
      </button>
      for making the (currently unnamed) mascot!
    </p>
  </div>
</template>
