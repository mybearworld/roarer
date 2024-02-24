<script setup lang="ts">
import { IconMessage, IconSettings, IconUser } from "@tabler/icons-vue";
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";
import { APIChat } from "../lib/schemas/chat";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
const { t } = useI18n();

const { chat } = defineProps<{
  chat: APIChat;
}>();
</script>

<template>
  <div class="flex gap-2">
    <RouterLink
      class="block w-full rounded-xl bg-accent px-2 py-1 text-left text-accent-text"
      :to="
        chat.nickname
          ? `/chats/${chat._id}`
          : `/users/${chat.members.find(
              (user) => user !== authStore.username,
            )}/dm`
      "
    >
      <p class="text-xl font-bold">
        {{
          chat.nickname ??
          chat.members.find((user) => user !== authStore.username)
        }}
      </p>
      <p class="flex items-center gap-1">
        <template v-if="chat.nickname">
          <IconUser class="inline-block h-4 w-4 min-w-4" aria-hidden />
          <span class="sr-only">Members:</span>
          <span class="line-clamp-1"> {{ chat.members.join(", ") }}</span>
        </template>
        <template v-else>
          <IconMessage class="inline-block h-4 w-4 min-w-4" aria-hidden />
          {{ t("chatDM") }}
        </template>
      </p>
    </RouterLink>
    <RouterLink
      class="flex items-center rounded-xl bg-accent px-2 py-1 text-accent-text"
      :to="`/chats/${chat._id}/settings`"
      v-if="chat.nickname"
    >
      <IconSettings aria-hidden />
      <span class="sr-only">
        {{ t("chatSettings") }}
      </span>
    </RouterLink>
  </div>
</template>
../lib/schemas/chatSchema ../stores/auth
