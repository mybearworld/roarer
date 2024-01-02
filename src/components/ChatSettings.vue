<script setup lang="ts">
import { ref } from "vue";
import { z } from "zod";
import { IconCrown, IconX } from "@tabler/icons-vue";
import { APIChat } from "../lib/chatSchema";
import { updateChatSchema } from "../lib/updateChatSchema";
import { useCloudlinkStore } from "../stores/cloudlink";
import { useLoginStatusStore } from "../stores/loginStatus";

const cloudlinkStore = useCloudlinkStore();
const loginStatusStore = useLoginStatusStore();

const { chat } = defineProps<{
  chat: APIChat;
}>();
const emit = defineEmits<{
  back: [];
}>();

if (!chat.nickname) {
  throw new Error("ChatSettings can only be used on group chats, not DMs");
}

const name = ref(chat.nickname);
const members = ref(chat.members);
const owner = ref(chat.owner);

const newChatName = ref(name);
const rename = async (e?: Event) => {
  e?.preventDefault();
  const { username, token } = loginStatusStore;
  if (!username || !token) {
    return;
  }
  const response = await fetch(`https://api.meower.org/chats/${chat._id}`, {
    method: "PATCH",
    headers: { username, token, "content-type": "application/json" },
    body: JSON.stringify({
      nickname: newChatName.value,
    }),
  });
  if (response.status !== 200) {
    alert(`Unexpected ${response.status} when trying to rename chat`);
  } else {
    alert("Renamed.");
  }
};

const addUserName = ref("");
const addUser = async (e?: Event) => {
  e?.preventDefault();
  const { username, token } = loginStatusStore;
  if (!username || !token) {
    return;
  }
  const response = await fetch(
    `https://api.meower.org/chats/${chat._id}/members/${addUserName.value}`,
    {
      method: "PUT",
      headers: { username, token },
    },
  );
  if (response.status !== 200) {
    alert(`Unexpected ${response.status} when trying to add user.`);
  }
};

const remove = async (person: string) => {
  const { username, token } = loginStatusStore;
  if (
    !username ||
    !token ||
    !confirm(
      `Are you sure you want to remove ${person}? You can add them back afterwards.`,
    )
  ) {
    return;
  }
  const response = await fetch(
    `https://api.meower.org/chats/${chat._id}/members/${person}`,
    {
      method: "DELETE",
      headers: { username, token },
    },
  );
  if (response.status !== 200) {
    alert(`Unexpected ${response.status} while removing user`);
  }
};

const leave = async () => {
  const { username, token } = loginStatusStore;
  if (
    !username ||
    !token ||
    !confirm(`Are you sure you want to leave this group?`)
  ) {
    return;
  }
  const response = await fetch(`https://api.meower.org/chats/${chat._id}`, {
    method: "DELETE",
    headers: { username, token },
  });
  if (response.status !== 200) {
    alert(`Unexpected ${response.status} when trying to leave chat`);
  }
};

const promote = async (person: string) => {
  const { username, token } = loginStatusStore;
  if (
    !username ||
    !token ||
    !confirm(
      `Are you sure you want to promote ${person}?\nYou will lose ownership of the group.`,
    )
  ) {
    return;
  }
  const response = await fetch(
    `https://api.meower.org/chats/${chat._id}/members/${person}/transfer`,
    {
      method: "POST",
      headers: { username, token },
    },
  );
  if (response.status !== 200) {
    alert(`Unexpected ${response.status} when trying to promote user`);
  }
};

const specificUpdateChatSchema = updateChatSchema.and(
  z.object({
    val: z.object({
      payload: z.object({
        _id: z.literal(chat._id),
      }),
    }),
  }),
);
cloudlinkStore.lookFor(
  specificUpdateChatSchema,
  (packet) => {
    if (packet.val.payload.nickname) {
      name.value = packet.val.payload.nickname;
    }
    if (packet.val.payload.owner) {
      owner.value = packet.val.payload.owner;
    }
    if (packet.val.payload.members) {
      members.value = packet.val.payload.members;
    }
  },
  false,
);
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2">
      <h2 class="text-xl font-bold">{{ name }}</h2>
      <button class="text-sky-400 underline" @click="emit('back')">Back</button>
    </div>
    <div class="space-y-2" v-if="loginStatusStore.username === owner">
      <h3 class="text-lg font-bold">Settings</h3>
      <form class="flex gap-2" @submit="rename">
        <input
          class="w-full rounded-lg bg-slate-800 px-2 py-1"
          type="text"
          v-model="newChatName"
        />
        <button type="submit" class="rounded-xl bg-slate-800 px-2 py-1">
          Rename
        </button>
      </form>
      <form class="flex gap-2" @submit="addUser">
        <input
          class="w-full rounded-lg bg-slate-800 px-2 py-1"
          placeholder="User..."
          type="text"
          v-model="addUserName"
        />
        <button type="submit" class="rounded-xl bg-slate-800 px-2 py-1">
          Add
        </button>
      </form>
    </div>
    <div class="space-y-2">
      <h3 class="text-lg font-bold">People</h3>
      <div class="flex gap-2" v-for="person in members">
        <div
          class="flex w-full items-center gap-2 rounded-xl bg-slate-800 px-2 py-1"
        >
          <h3 class="inline-block text-lg font-bold">{{ person }}</h3>
          <IconCrown class="inline-block" aria-hidden v-if="person === owner" />
          <span class="sr-only">Owner</span>
        </div>
        <button
          type="button"
          class="rounded-xl bg-slate-800 px-2 py-1"
          @click="promote(person)"
          v-if="
            owner === loginStatusStore.username &&
            person !== loginStatusStore.username
          "
        >
          <IconCrown aria-hidden />
          <span class="sr-only">Promote</span>
        </button>
        <button
          type="button"
          class="rounded-xl bg-slate-800 px-2 py-1"
          @click="
            person === loginStatusStore.username ? leave() : remove(person)
          "
          v-if="
            owner === loginStatusStore.username ||
            person === loginStatusStore.username
          "
        >
          <IconX aria-hidden />
          <span class="sr-only">Remove</span>
        </button>
      </div>
    </div>
  </div>
</template>
