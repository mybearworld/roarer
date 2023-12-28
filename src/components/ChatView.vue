<script setup lang="ts">
import { z } from "zod";
import { IconUser } from "@tabler/icons-vue";
import { APIChat } from "../lib/chatSchema";

const { chat } = defineProps<{
  chat: APIChat;
}>();
const emit = defineEmits<{
  open: [id: APIChat];
}>();
</script>

<template>
  <button
    class="block w-full rounded-xl bg-slate-800 px-2 py-1 text-left"
    @click="emit('open', chat)"
  >
    <p class="text-xl font-bold">{{ chat.nickname }}</p>
    <p class="flex gap-1">
      <IconUser class="inline-block w-4" />
      {{ chat.members.join(", ") }}
    </p>
  </button>
</template>
