<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";
import { bridgeBots } from "../lib/bridgeBots";
import { APIChat } from "../lib/schemas/chat";
import { useOnlinelistStore } from "../stores/onlinelist";

const { chat } = defineProps<{
  chat?: APIChat;
}>();

const onlineListStore = useOnlinelistStore();
const { t } = useI18n();

const shownOnlineList = computed(() =>
  onlineListStore.online.filter((user) => !chat || chat.members.includes(user)),
);
</script>

<template>
  <details>
    <summary class="cursor-pointer">
      {{ t("onlineUsers", { n: shownOnlineList.length }) }}
    </summary>
    <span v-for="(user, index) in shownOnlineList">
      <RouterLink class="text-link underline" :to="`/users/${user}`">
        {{ user }} </RouterLink
      >{{ index === shownOnlineList.length - 1 ? "" : ", " }}
    </span>
  </details>
</template>
