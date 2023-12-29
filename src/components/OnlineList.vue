<script setup lang="ts">
import { computed } from "vue";
import { z } from "zod";
import { bridgeBots } from "../lib/bridgeBots";
import { APIChat } from "../lib/chatSchema";
import { useOnlinelistStore } from "../stores/onlinelist";

const { chat } = defineProps<{
  chat?: APIChat;
}>();

const onlineListStore = useOnlinelistStore();

const shownOnlineList = computed(() =>
  onlineListStore.online.filter(
    (user) =>
      (!chat || chat.members.includes(user)) && !bridgeBots.includes(user),
  ),
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
