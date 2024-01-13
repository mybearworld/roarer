<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import Navigation from "../Navigation.vue";
import Posts from "../Posts.vue";
import { getResponseFromAPIRequest } from "../../lib/apiRequest";
import { APIChat, chatSchema } from "../../lib/chatSchema";
import { useLoginStatusStore } from "../../stores/loginStatus";

const loginStatusStore = useLoginStatusStore();
const route = useRoute();
const { t } = useI18n();

const chat = ref<APIChat | null>(null);
(async () => {
  const response = await getResponseFromAPIRequest(
    route.params.id
      ? `/chats/${route.params.id}`
      : `/users/${route.params.username}/dm`,
    {
      schema: chatSchema,
      auth: loginStatusStore,
    },
  );
  if ("status" in response) {
    alert(t("getChatFail", { status: response.status }));
    return;
  }
  chat.value = response;
})();
</script>

<template>
  <div class="space-y-2">
    <Posts :chat="chat" v-if="chat" />
  </div>
</template>
