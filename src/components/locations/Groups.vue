<script setup lang="ts">
import { effect, ref } from "vue";
import { z } from "zod";
import ChatView from "../ChatView.vue";
import Posts from "../Posts.vue";
import Navigation from "../Navigation.vue";
import { chatSchema, APIChat } from "../../lib/chatSchema";
import { useCloudlinkStore } from "../../stores/cloudlink";
import { useLoginStatusStore } from "../../stores/loginStatus";

const cloudlinkStore = useCloudlinkStore();
const loginStatusStore = useLoginStatusStore();

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

const chatNickname = ref<HTMLInputElement | null>(null);
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
      nickname: chatNickname.value.value,
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

const openGroupchat = ref<APIChat | null>(null);
const open = (chat: APIChat) => {
  openGroupchat.value = chat;
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
          ref="chatNickname"
        />
        <button type="submit" class="rounded-xl bg-slate-800 px-2 py-1">
          Create
        </button>
      </form>
      <ChatView :chat="chat" @open="open" v-for="chat in chats" />
    </template>
    <Posts :chat="openGroupchat" v-else />
  </div>
</template>
