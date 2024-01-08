<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { z } from "zod";
import { APIChat } from "../lib/chatSchema";
import {
  autoResizeTextarea,
  resetTextareaSize,
} from "../lib/autoResizeTextarea";
import { getReply } from "../lib/getReply";
import { postSchema } from "../lib/postSchema";
import { useCloudlinkStore } from "../stores/cloudlink";
import { useLoginStatusStore } from "../stores/loginStatus";

const { chat } = defineProps<{
  chat?: APIChat;
}>();

const cloudlinkStore = useCloudlinkStore();
const loginStatusStore = useLoginStatusStore();
const { t } = useI18n();

const postContent = ref("");
const posting = ref(false);
const errorMessage = ref("");

const post = async (e?: Event) => {
  e?.preventDefault();
  if (posting.value) {
    return;
  }
  const username = loginStatusStore.username;
  if (username === null) {
    throw new Error("Not logged in");
  }
  posting.value = true;
  try {
    await cloudlinkStore.send(
      {
        cmd: chat ? "post_chat" : "post_home",
        val: chat
          ? {
              chatid: chat._id,
              p: postContent.value,
            }
          : postContent.value,
      },
      postSchema.and(
        z.object({
          post_origin: z.literal(chat?._id ?? "home"),
          u: z.literal(username),
        }),
      ),
    );
    errorMessage.value = "";
  } catch (e) {
    posting.value = false;
    errorMessage.value = e as string;
  }
  postContent.value = "";
  if (inputRef.value) {
    resetTextareaSize(inputRef.value);
  }
  posting.value = false;
};

const trimmedPost = (post: string) => {
  const reply = getReply(post);
  const postContent = reply ? reply.postContent : post;
  const slicedPostContent = postContent.slice(0, 40);
  const replacedPostContent = slicedPostContent
    .slice(0, 40)
    .replace(/: /g, ":  ") // images shouldn't appear in replies

    .replace(/!/g, "!\u200c") // markdown images
    .replace(/\n/g, " ");
  return `"${replacedPostContent.slice(0, 40).trim()}${
    postContent.length > 39 ? "…" : ""
  }"`;
};

const inputRef = ref<HTMLTextAreaElement | null>(null);
const reply = (username: string, content: string, postId: string) => {
  postContent.value =
    `@${username} ${trimmedPost(content)} (${postId})\n` + postContent.value;
  if (inputRef.value) {
    inputRef.value.focus();
    autoResizeTextarea(inputRef.value);
  }
};

const lastTypingIndicatorSent = ref<number | null>(null);
const input = () => {
  const currentDate = new Date().getTime();
  if (inputRef.value) {
    autoResizeTextarea(inputRef.value);
  }
  if (
    lastTypingIndicatorSent.value === null ||
    lastTypingIndicatorSent.value + 1500 < currentDate
  ) {
    lastTypingIndicatorSent.value = currentDate;
    cloudlinkStore.cloudlink.send({
      cmd: "direct",
      listener: "typing_indicator",
      val: {
        cmd: "set_chat_state",
        val: {
          chatid: chat ? chat._id : "livechat",
          state: chat ? 100 : 101,
        },
      },
    });
  }
};

const keydown = (e: KeyboardEvent) => {
  if (e.key === "Enter") {
    if (!e.shiftKey) {
      e.preventDefault();
      post();
    }
  }
};

defineExpose({ reply });
</script>

<template>
  <form @submit="post" class="flex space-x-2">
    <textarea
      class="w-full resize-none rounded-lg bg-slate-800 px-2 py-1"
      :placeholder="$t('enterPostPlaceholder')"
      @input="input"
      @keydown="keydown"
      v-model="postContent"
      ref="inputRef"
      rows="1"
    />
    <button type="submit" class="text-nowrap rounded-xl bg-slate-800 px-2 py-1">
      {{ $t("enterPostSend") }}
    </button>
  </form>
  <p v-if="errorMessage">{{ errorMessage }}</p>
</template>
