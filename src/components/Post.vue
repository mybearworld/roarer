<script setup lang="ts">
import { ref } from "vue";
import {
  IconBrandDiscord,
  IconMessageDots,
  IconWebhook,
} from "@tabler/icons-vue";
import { z } from "zod";
import { postSchema } from "../lib/postSchema";

const { post } = defineProps<{
  post: z.infer<typeof postSchema>;
}>();

const username = ref(post.u);
const postContent = ref(post.p);

const isBridged = username.value === "Discord" || username.value === "Webhooks";
if (isBridged) {
  const match = postContent.value.match(/^(.*?): (.*)$/);
  if (match) {
    username.value = match[1];
    postContent.value = match[2];
  }
}

const emit = defineEmits<{
  reply: [post: z.infer<typeof postSchema>];
}>();
</script>

<template>
  <div class="flex flex-col rounded-xl bg-slate-800 px-2 py-1">
    <div class="space-x-2">
      <span class="font-bold">{{ username }}</span>
      <span
        title="This post was created on the Discord server."
        v-if="post.u === 'Discord'"
      >
        <IconBrandDiscord class="inline-block w-5" />
      </span>
      <span
        title="This post was created via a Webhook. These do not go through Meowers account system, anyone can create a message under any name."
        v-if="post.u === 'Webhooks'"
      >
        <IconWebhook class="inline-block w-5" />
      </span>
      <button class="float-right" @click="emit('reply', post)">
        <IconMessageDots />
      </button>
    </div>
    {{ postContent }}
  </div>
</template>
