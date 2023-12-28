<script setup lang="ts">
import { effect, ref } from "vue";
import { z } from "zod";
import ChatView from "../ChatView.vue";
import Posts from "../Posts.vue";
import Navigation from "../Navigation.vue";
import { chatSchema } from "../../lib/chatSchema";
import { useCloudlinkStore } from "../../stores/cloudlink";

const cloudlinkStore = useCloudlinkStore();

const chats = ref<z.infer<typeof chatSchema>[]>([]);
const postSchema = z.object({
  mode: z.literal("chats"),
  payload: z.object({
    all_chats: chatSchema.array(),
    index: z.string().array(),
    "page#": z.number(),
    pages: z.number(),
  }),
});
effect(async () => {
  let response;
  try {
    response = await cloudlinkStore.send(
      {
        cmd: "get_chat_list",
        val: { page: 1 },
      },
      postSchema,
    );
  } catch (e) {
    alert(e);
    return;
  }
  chats.value = response.payload.all_chats;
});

const openGroupchat = ref<z.infer<typeof chatSchema> | null>(null);
const open = (chat: z.infer<typeof chatSchema>) => {
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
