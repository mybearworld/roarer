<script setup lang="ts">
import { ref } from "vue";
import { z } from "zod";
import { APIChat } from "../lib/chatSchema";
import { postSchema, APIPost } from "../lib/postSchema";
import { useCloudlinkStore } from "../stores/cloudlink";
import { useLoginStatusStore } from "../stores/loginStatus";

const { chat } = defineProps<{
  chat?: APIChat;
}>();

const cloudlinkStore = useCloudlinkStore();
const loginStatusStore = useLoginStatusStore();

const postContent = ref("");
const errorMessage = ref("");

const post = async (e?: Event) => {
  e?.preventDefault();
  const username = loginStatusStore.username;
  if (username === null) {
    throw new Error("Not logged in");
  }
  try {
    await cloudlinkStore.send(
      {
        cmd: chat ? "post_chat" : "post_home",
        val: chat
          ? { chatid: chat._id, p: postContent.value }
          : postContent.value,
      },
      postSchema.and(
        z.object({
          post_origin: z.literal(chat?._id ?? "home"),
          u: z.literal(username),
        }),
      ),
    );
  } catch (e) {
    errorMessage.value = e as string;
  }
  postContent.value = "";
};

const inputRef = ref<HTMLInputElement | null>(null);
const reply = (post: APIPost) => {
  postContent.value = `@${post.u} [${post.post_id}] ` + postContent.value;
  inputRef.value?.focus();
};

const lastTypingIndicatorSent = ref<number | null>(null);
const input = () => {
  const currentDate = new Date().getTime();
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
          chatid: "livechat",
          state: 101,
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
      class="w-full resize-y rounded-lg bg-slate-800 px-2 py-1"
      placeholder="Say something!"
      @input="input"
      @keydown="keydown"
      v-model="postContent"
      ref="inputRef"
      rows="1"
    />
    <button type="submit" class="rounded-xl bg-slate-800 px-2 py-1">
      Send!
    </button>
  </form>
  <p v-if="errorMessage">{{ errorMessage }}</p>
</template>
