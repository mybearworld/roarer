<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import ChatSettings from "../ChatSettings.vue";
import { getResponseFromAPIRequest } from "../../lib/apiRequest";
import { APIChat, chatSchema } from "../../lib/schemas/chat";

const route = useRoute();
const { t } = useI18n();

const chat = ref<APIChat | null>(null);
(async () => {
  const response = await getResponseFromAPIRequest(
    `/chats/${route.params.id}`,
    {
      schema: chatSchema,
      auth: true,
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
    <ChatSettings :chat="chat" v-if="chat" />
  </div>
</template>
../../lib/schemas/chatSchema
