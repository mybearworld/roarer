<script setup lang="ts">
import { effect, ref } from "vue";
import { z } from "zod";
import ChatSettings from "../ChatSettings.vue";
import ChatView from "../ChatView.vue";
import Posts from "../Posts.vue";
import Navigation from "../Navigation.vue";
import { chatSchema, APIChat } from "../../lib/chatSchema";
import { updateChatSchema } from "../../lib/updateChatSchema";
import { useCloudlinkStore } from "../../stores/cloudlink";
import { useLoginStatusStore } from "../../stores/loginStatus";
import { useLocationStore } from "../../stores/location";

const cloudlinkStore = useCloudlinkStore();
const loginStatusStore = useLoginStatusStore();
const locationStore = useLocationStore();

const chats = ref<APIChat[]>([]);
const schema = z.object({
  autoget: chatSchema.array(),
});
effect(async () => {
  const { username, token } = loginStatusStore;
  if (username === null || token === null) {
    return;
  }
  const unsafeResponse = await (
    await fetch("https://api.meower.org/chats?autoget=1", {
      headers: {
        username,
        token,
      },
    })
  ).json();
  const response = schema.parse(unsafeResponse);
  chats.value = response.autoget;
});

const chatNickname = ref("");
const createChat = async (e?: Event) => {
  e?.preventDefault();
  const { username, token } = loginStatusStore;
  if (username === null || token === null || chatNickname.value === null) {
    return;
  }
  const response = await fetch("https://api.meower.org/chats", {
    method: "POST",
    headers: { username, token, "content-type": "application/json" },
    body: JSON.stringify({
      nickname: chatNickname.value,
    }),
  });
  if (response.status !== 200) {
    alert(`Failed creating chat: ${response.status}`);
  }
};

const newChatSchema = z.object({
  cmd: z.literal("direct"),
  val: z.object({
    mode: z.literal("create_chat"),
    payload: chatSchema,
  }),
});
cloudlinkStore.lookFor(
  newChatSchema,
  (packet) => {
    chats.value.push(packet.val.payload);
    chats.value = chats.value;
  },
  false,
);

const deleteChatSchema = z.object({
  cmd: z.literal("direct"),
  val: z.object({
    mode: z.literal("delete"),
    id: z.string(),
  }),
});
cloudlinkStore.lookFor(deleteChatSchema, (packet) => {
  chats.value = chats.value.filter((chat) => chat._id !== packet.val.id);
  if (openGroupchat.value?._id === packet.val.id) {
    openGroupchat.value = null;
  }
});

cloudlinkStore.lookFor(
  updateChatSchema,
  (packet) => {
    const index = chats.value.findIndex(
      (chat) => packet.val.payload._id === chat._id,
    );
    if (packet.val.payload.nickname) {
      chats.value[index].nickname = packet.val.payload.nickname;
    }
    if (packet.val.payload.owner) {
      chats.value[index].owner = packet.val.payload.owner;
    }
    if (packet.val.payload.members) {
      chats.value[index].members = packet.val.payload.members;
    }
    chats.value = chats.value;
  },
  false,
);

effect(async () => {
  const { username, token } = loginStatusStore;
  if (!username || !token) {
    return;
  }
  if (
    locationStore.sublocation &&
    locationStore.sublocation.startsWith("dm:")
  ) {
    const dmUser = locationStore.sublocation.slice(3);
    const response = await fetch(`https://api.meower.org/users/${dmUser}/dm`, {
      headers: { username, token },
    });
    const safeResponse = chatSchema.parse(await response.json());
    openGroupchat.value = safeResponse;
    section.value = "main";
  }
});

const openGroupchat = ref<APIChat | null>(null);
const section = ref<null | "settings" | "main">(null);
const open = (chat: APIChat) => {
  openGroupchat.value = chat;
  section.value = "main";
};
const settings = (chat: APIChat) => {
  openGroupchat.value = chat;
  section.value = "settings";
};
</script>

<template>
  <div class="block space-y-2">
    <Navigation title="Groups" />
    <template v-if="openGroupchat === null">
      <form class="flex gap-2" @submit="createChat">
        <input
          type="text"
          placeholder="Nickname"
          class="w-full rounded-lg bg-slate-800 px-2 py-1"
          v-model="chatNickname"
        />
        <button type="submit" class="rounded-xl bg-slate-800 px-2 py-1">
          Create
        </button>
      </form>
      <ChatView
        :chat="chat"
        @open="open"
        @settings="settings"
        v-for="chat in chats"
      />
    </template>
    <Posts :chat="openGroupchat" v-else-if="section === 'main'" />
    <ChatSettings :chat="openGroupchat" @back="openGroupchat = null" v-else />
  </div>
</template>
