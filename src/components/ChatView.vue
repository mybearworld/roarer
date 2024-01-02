<script setup lang="ts">
import { ref } from "vue";
import { IconMessage, IconUser } from "@tabler/icons-vue";
import { APIChat } from "../lib/chatSchema";
import { useLoginStatusStore } from "../stores/loginStatus";

const loginStatusStore = useLoginStatusStore();

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
    <p class="text-xl font-bold">
      {{
        chat.nickname ??
        chat.members.find((user) => user !== loginStatusStore.username)
      }}
    </p>
    <p class="flex items-center gap-1">
      <template v-if="chat.nickname">
        <IconUser class="inline-block h-4 w-4 min-w-4" aria-hidden />
        <span class="sr-only">Members:</span>
        {{ chat.members.join(", ") }}
      </template>
      <template v-else>
        <IconMessage class="inline-block h-4 w-4 min-w-4" aria-hidden />
        DM
      </template>
    </p>
  </button>
</template>
