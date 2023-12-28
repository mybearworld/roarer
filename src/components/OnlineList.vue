<script setup lang="ts">
import { computed } from "vue";
import { z } from "zod";
import { chatSchema } from "../lib/chatSchema";
import { useOnlinelistStore } from "../stores/onlinelist";

const { chat } = defineProps<{
  chat?: z.infer<typeof chatSchema>;
}>();

const onlineListStore = useOnlinelistStore();

const shownOnlineList = computed(() =>
  chat
    ? onlineListStore.online.filter((user) => chat.members.includes(user))
    : onlineListStore.online,
);
</script>

<template>
  <details>
    <summary class="cursor-pointer">
      Online users ({{ shownOnlineList.length }})
    </summary>
    {{ shownOnlineList.join(", ") }}
  </details>
</template>
