<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import ChatSettings from "../ChatSettings.vue";
import { getResponseFromAPIRequest } from "../../lib/apiRequest";
import { APIChat, chatSchema } from "../../lib/schemas/chat";
import { useDialogStore } from "../../stores/dialog";

const dialogStore = useDialogStore();
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
  if (response.error !== null) {
    await dialogStore.alert(t("getChatFail", { status: response.error }));
    return;
  }
  chat.value = response.data;
})();
</script>

<template>
  <div class="space-y-2">
    <ChatSettings :chat="chat" v-if="chat" />
  </div>
</template>
