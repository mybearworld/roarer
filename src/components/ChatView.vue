<script setup lang="ts">
import {
  IconMessage,
  IconSettings,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-vue";
import { APIChat } from "../lib/chatSchema";
import { useLoginStatusStore } from "../stores/loginStatus";

const loginStatusStore = useLoginStatusStore();

const { chat } = defineProps<{
  chat: APIChat;
}>();
const emit = defineEmits<{
  open: [chat: APIChat];
  settings: [chat: APIChat];
}>();
</script>

<template>
  <div class="flex gap-2">
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
    <button
      class="rounded-xl bg-slate-800 px-2 py-1"
      @click="emit('settings', chat)"
      v-if="chat.nickname"
    >
      <IconSettings
        aria-hidden
        v-if="chat.owner === loginStatusStore.username"
      />
      <IconUsersGroup aria-hidden v-else />
      <span class="sr-only">
        {{ chat.owner === loginStatusStore.username ? "Settings" : "People" }}
      </span>
    </button>
  </div>
</template>
