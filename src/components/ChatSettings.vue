<script setup lang="ts">
import { ref } from "vue";
import { z } from "zod";
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";
import { IconCrown, IconX } from "@tabler/icons-vue";
import { apiRequest } from "../lib/apiRequest";
import { APIChat } from "../lib/chatSchema";
import { updateChatSchema } from "../lib/updateChatSchema";
import { useCloudlinkStore } from "../stores/cloudlink";
import { useLoginStatusStore } from "../stores/loginStatus";

const cloudlinkStore = useCloudlinkStore();
const loginStatusStore = useLoginStatusStore();
const { t } = useI18n();

const { chat } = defineProps<{
  chat: APIChat;
}>();
const emit = defineEmits<{
  back: [];
}>();

if (!chat.nickname) {
  throw new Error("ChatSettings can only be used on group chats, not DMs");
}

const name = ref(chat.nickname);
const members = ref(chat.members);
const owner = ref(chat.owner);

const newChatName = ref(name.value);
const rename = async (e?: Event) => {
  e?.preventDefault();
  const response = await apiRequest(`/chats/${chat._id}`, {
    auth: loginStatusStore,
    method: "PATCH",
    body: JSON.stringify({
      nickname: newChatName.value,
    }),
  });
  if (response.status !== 200) {
    alert(t("renameChatFail", { status: response.status }));
  }
};

const addUserName = ref("");
const addUser = async (e?: Event) => {
  e?.preventDefault();
  const response = await apiRequest(
    `/chats/${chat._id}/members/${addUserName.value}`,
    {
      auth: loginStatusStore,
      method: "PUT",
    },
  );
  if (response.status !== 200) {
    alert(t("addMemberChatFail", { status: response.status }));
  }
};

const remove = async (person: string) => {
  if (
    !confirm(
      `Are you sure you want to remove ${person}? You can add them back afterwards.`,
    )
  ) {
    return;
  }
  const response = await apiRequest(`/chats/${chat._id}/members/${person}`, {
    method: "DELETE",
    auth: loginStatusStore,
  });
  if (response.status !== 200) {
    alert(t("removeMemberChatFail", { status: response.status }));
  }
};

const leave = async () => {
  const response = await apiRequest(`/chats/${chat._id}`, {
    method: "DELETE",
    auth: loginStatusStore,
  });
  if (response.status !== 200) {
    alert(t("leaveChatFail", { status: response.status }));
  }
};

const promote = async (person: string) => {
  if (
    !confirm(
      `Are you sure you want to promote ${person}?\nYou will lose ownership of the group.`,
    )
  ) {
    return;
  }
  const response = await apiRequest(
    `/chats/${chat._id}/members/${person}/transfer`,
    {
      method: "POST",
      auth: loginStatusStore,
    },
  );
  if (response.status !== 200) {
    alert(t("promoteChatFail", { status: response.status }));
  }
};

const specificUpdateChatSchema = updateChatSchema.and(
  z.object({
    val: z.object({
      payload: z.object({
        _id: z.literal(chat._id),
      }),
    }),
  }),
);
cloudlinkStore.lookFor(
  specificUpdateChatSchema,
  (packet) => {
    if (packet.val.payload.nickname) {
      name.value = packet.val.payload.nickname;
    }
    if (packet.val.payload.owner) {
      owner.value = packet.val.payload.owner;
    }
    if (packet.val.payload.members) {
      members.value = packet.val.payload.members;
    }
  },
  false,
);
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2">
      <h2 class="text-xl font-bold">{{ name }}</h2>
      <RouterLink to="/chats" class="text-link underline">
        {{ t("back") }}
      </RouterLink>
    </div>
    <div class="space-y-2" v-if="loginStatusStore.username === owner">
      <h3 class="text-lg font-bold">{{ t("chatSettings") }}</h3>
      <form class="flex gap-2" @submit="rename">
        <input
          class="w-full rounded-lg border-2 border-accent bg-transparent px-2 py-1"
          type="text"
          v-model="newChatName"
        />
        <button type="submit" class="rounded-xl bg-accent px-2 py-1">
          {{ t("chatRename") }}
        </button>
      </form>
      <form class="flex gap-2" @submit="addUser">
        <input
          class="w-full rounded-lg border-2 border-accent bg-transparent px-2 py-1"
          placeholder="User..."
          type="text"
          v-model="addUserName"
        />
        <button type="submit" class="rounded-xl bg-accent px-2 py-1">
          {{ t("chatAddMember") }}
        </button>
      </form>
    </div>
    <div class="space-y-2">
      <h3 class="text-lg font-bold">{{ t("chatPeople") }}</h3>
      <div class="flex gap-2" v-for="person in members">
        <div
          class="flex w-full items-center gap-2 rounded-xl bg-accent px-2 py-1"
        >
          <h3 class="inline-block text-lg font-bold">{{ person }}</h3>
          <IconCrown class="inline-block" aria-hidden v-if="person === owner" />
          <span class="sr-only">{{ t("chatOwner") }}</span>
        </div>
        <button
          type="button"
          class="rounded-xl bg-accent px-2 py-1"
          @click="promote(person)"
          v-if="
            owner === loginStatusStore.username &&
            person !== loginStatusStore.username
          "
        >
          <IconCrown aria-hidden />
          <span class="sr-only">{{ t("chatPromote") }}</span>
        </button>
        <button
          type="button"
          class="rounded-xl bg-accent px-2 py-1"
          @click="
            person === loginStatusStore.username ? leave() : remove(person)
          "
          v-if="
            owner === loginStatusStore.username ||
            person === loginStatusStore.username
          "
        >
          <IconX aria-hidden />
          <span class="sr-only">{{ t("chatRemove") }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
