<script setup lang="ts">
import { ref } from "vue";
import { IconMessage } from "@tabler/icons-vue";
import { useI18n } from "vue-i18n";
import { useRoute, RouterLink } from "vue-router";
import {
  ToastAction,
  ToastDescription,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport,
} from "radix-vue";
import { z } from "zod";
import { getResponseFromAPIRequest } from "../lib/apiRequest";
import { chatSchema, APIChat } from "../lib/chatSchema";
import { getPostInfo, PostInfo } from "../lib/postInfo";
import { postSchema, APIPost } from "../lib/postSchema";
import { useCloudlinkStore } from "../stores/cloudlink";
import { useLoginStatusStore } from "../stores/loginStatus";
import { useSettingsStore } from "../stores/settings";

const cloudlinkStore = useCloudlinkStore();
const loginStatusStore = useLoginStatusStore();
const settingsStore = useSettingsStore();
const route = useRoute();
const { t } = useI18n();

const newPosts = ref<{ post: PostInfo; chat: APIChat }[]>([]);

cloudlinkStore.lookFor(
  z.object({
    cmd: z.literal("direct"),
    val: postSchema.and(
      z.object({
        post_origin: z
          .string()
          .refine(
            (origin) =>
              origin !== "home" &&
              !("isChat" in route.meta && route.params.id === origin),
          ),
        u: z.string().refine((name) => name !== loginStatusStore.username),
      }),
    ),
  }),
  async (packet) => {
    const chat = await getResponseFromAPIRequest(
      `/chats/${packet.val.post_origin}`,
      {
        auth: loginStatusStore,
        schema: chatSchema,
      },
    );
    if ("status" in chat) {
      console.log(`Failed to get chat (${chat.status}):`, packet.val);
      return;
    }
    newPosts.value.push({ chat, post: getPostInfo(packet.val) });
    newPosts.value = newPosts.value;
  },
  false,
);
</script>

<template>
  <ToastProvider label="DM">
    <ToastRoot
      class="ToastRoot z-20 flex gap-2 rounded-xl bg-slate-800 px-2 py-1 text-accent-text shadow-lg"
      :delay="5000"
      @update:open="
        (open: boolean) => {
          if (open) {
            return;
          }
          newPosts = newPosts.slice(0, index).concat(newPosts.slice(index + 1));
          newPosts = newPosts;
        }
      "
      :key="post.id"
      v-for="({ post, chat }, index) in newPosts"
    >
      <div>
        <ToastTitle class="line-clamp-1 font-bold">
          <span v-if="chat.nickname === null">
            {{ t("newDMToast", { username: post.username }) }}
          </span>
          <span v-else>
            {{
              t("newChatMessageToast", {
                username: post.username,
                chat: chat.nickname,
              })
            }}
          </span>
        </ToastTitle>
        <ToastDescription class="line-clamp-1">
          {{ post.content }}
        </ToastDescription>
      </div>
      <ToastAction :altText="t('chatActionAlt')">
        <RouterLink
          class="underline"
          :to="
            chat.nickname === null
              ? `/users/${post.username}/dm`
              : `/chats/${chat._id}`
          "
        >
          <IconMessage />
        </RouterLink>
      </ToastAction>
    </ToastRoot>

    <ToastViewport class="fixed bottom-0 right-0 max-w-80 space-y-2 p-2" />
  </ToastProvider>
</template>
