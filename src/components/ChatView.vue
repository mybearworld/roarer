<script setup lang="ts">
import {
  IconMessage,
  IconSettings,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-vue";
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";
import { APIChat } from "../lib/chatSchema";
import { useLoginStatusStore } from "../stores/loginStatus";

const loginStatusStore = useLoginStatusStore();
const { t } = useI18n();

const { chat } = defineProps<{
  chat: APIChat;
}>();
</script>

<template>
  <div class="flex gap-2">
    <RouterLink
      class="block w-full rounded-xl bg-accent px-2 py-1 text-left"
      :to="
        chat.nickname
          ? `/chats/${chat._id}`
          : `/users/${chat.members.find(
              (user) => user !== loginStatusStore.username,
            )}/dm`
      "
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
          <span class="line-clamp-1"> {{ chat.members.join(", ") }}</span>
        </template>
        <template v-else>
          <IconMessage class="inline-block h-4 w-4 min-w-4" aria-hidden />
          {{ t("chatDM") }}
        </template>
      </p>
    </RouterLink>
    <RouterLink
      class="flex items-center rounded-xl bg-accent px-2 py-1"
      :to="`/chats/${chat._id}/settings`"
      v-if="chat.nickname"
    >
      <IconSettings
        aria-hidden
        v-if="chat.owner === loginStatusStore.username"
      />
      <IconUsersGroup aria-hidden v-else />
      <span class="sr-only">
        {{
          chat.owner === loginStatusStore.username
            ? t("chatSettings")
            : t("chatPeople")
        }}
      </span>
    </RouterLink>
  </div>
</template>
