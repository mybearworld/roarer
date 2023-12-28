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

const openGroupchat = ref<APIChat | null>(null);
const open = (chat: APIChat) => {
  openGroupchat.value = chat;
};
</script>

<template>
  <div class="block space-y-2">
    <Navigation title="Groups" />
    <ChatView
      :chat="chat"
      @open="open"
      v-for="chat in chats"
      v-if="openGroupchat === null"
    />
    <Posts :chat="openGroupchat" v-else />
  </div>
</template>
