<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { bridgeBots } from "../lib/bridgeBots";
import { APIChat } from "../lib/chatSchema";
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
    {{ shownOnlineList.join(", ") }}
  </details>
</template>
