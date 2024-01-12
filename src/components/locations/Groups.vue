<script setup lang="ts">
import { computed, effect, ref } from "vue";
import { z } from "zod";
import { useI18n } from "vue-i18n";
import ChatSettings from "../ChatSettings.vue";
import ChatView from "../ChatView.vue";
import Posts from "../Posts.vue";
import Navigation from "../Navigation.vue";
import { apiRequest, getResponseFromAPIRequest } from "../../lib/apiRequest";
import { chatSchema, APIChat } from "../../lib/chatSchema";
import { updateChatSchema } from "../../lib/updateChatSchema";
import { useCloudlinkStore } from "../../stores/cloudlink";
import { useLoginStatusStore } from "../../stores/loginStatus";
import { useLocationStore } from "../../stores/location";

const cloudlinkStore = useCloudlinkStore();
const loginStatusStore = useLoginStatusStore();
const locationStore = useLocationStore();
const { t } = useI18n();

const chats = ref<APIChat[]>([]);
const schema = z.object({
  autoget: chatSchema.array(),
});
effect(async () => {
  const response = await getResponseFromAPIRequest("/chats?autoget=1", {
    auth: loginStatusStore,
    schema,
  });
  if ("status" in response) {
    alert(t("getChatsFail", { status: response.status }));
    return;
  }
  chats.value = response.autoget;
});

const sortedChats = computed(() =>
  chats.value.sort(
    (a, b) =>
      new Date(b.last_active * 1000).getTime() -
      new Date(a.last_active * 1000).getTime(),
  ),
);

const chatNickname = ref("");
const createChat = async (e?: Event) => {
  e?.preventDefault();
  if (chatNickname.value === null) {
    return;
  }
  const response = await apiRequest("/chats", {
    method: "POST",
    auth: loginStatusStore,
    body: JSON.stringify({
      nickname: chatNickname.value,
    }),
  });
  if (response.status !== 200) {
    alert(t("createChatFail", { status: response.status }));
  }
};

const newChatSchema = z.object({
  cmd: z.literal("direct"),
  val: z.object({
    mode: z.literal("create_chat"),
    payload: chatSchema,
  }),
});
cloudlinkStore.lookFor(
  newChatSchema,
  (packet) => {
    chats.value.push(packet.val.payload);
    chats.value = chats.value;
  },
  false,
);

const deleteChatSchema = z.object({
  cmd: z.literal("direct"),
  val: z.object({
    mode: z.literal("delete"),
    id: z.string(),
  }),
});
cloudlinkStore.lookFor(deleteChatSchema, (packet) => {
  chats.value = chats.value.filter((chat) => chat._id !== packet.val.id);
  if (openGroupchat.value?._id === packet.val.id) {
    openGroupchat.value = null;
  }
});

cloudlinkStore.lookFor(
  updateChatSchema,
  (packet) => {
    const index = chats.value.findIndex(
      (chat) => packet.val.payload._id === chat._id,
    );
    if (packet.val.payload.nickname) {
      chats.value[index].nickname = packet.val.payload.nickname;
    }
    if (packet.val.payload.owner) {
      chats.value[index].owner = packet.val.payload.owner;
    }
    if (packet.val.payload.members) {
      chats.value[index].members = packet.val.payload.members;
    }
    chats.value = chats.value;
  },
  false,
);

effect(async () => {
  if (
    !locationStore.sublocation ||
    !locationStore.sublocation.startsWith("dm:")
  ) {
    return;
  }
  const dmUser = locationStore.sublocation.slice(3);
  const response = await getResponseFromAPIRequest(`/users/${dmUser}/dm`, {
    auth: loginStatusStore,
    schema: chatSchema,
  });
  if ("status" in response) {
    alert(t("openDMFail", { status: response.status }));
    return;
  }
  openGroupchat.value = response;
  section.value = "main";
});

const openGroupchat = ref<APIChat | null>(null);
const section = ref<null | "settings" | "main">(null);
const open = (chat: APIChat) => {
  openGroupchat.value = chat;
  section.value = "main";
};
const settings = (chat: APIChat) => {
  openGroupchat.value = chat;
  section.value = "settings";
};
</script>

<template>
  <div class="block space-y-2">
    <Navigation :title="t('routeGroups')" />
    <template v-if="openGroupchat === null">
      <form class="flex gap-2" @submit="createChat">
        <input
          type="text"
          :placeholder="t('chatNickname')"
          class="w-full rounded-lg bg-slate-800 px-2 py-1"
          v-model="chatNickname"
        />
        <button
          type="submit"
          class="text-nowrap rounded-xl bg-slate-800 px-2 py-1"
        >
          {{ t("createChat") }}
        </button>
      </form>
      <ChatView
        :chat="chat"
        @open="open"
        @settings="settings"
        v-for="chat in sortedChats"
      />
    </template>
    <Posts :chat="openGroupchat" v-else-if="section === 'main'" />
    <ChatSettings :chat="openGroupchat" @back="openGroupchat = null" v-else />
  </div>
</template>
