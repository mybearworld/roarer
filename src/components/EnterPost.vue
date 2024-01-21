<script setup lang="ts">
import { ref } from "vue";
import { Popover } from "@ark-ui/vue";
import { IconMoodHappy } from "@tabler/icons-vue";
import { useI18n } from "vue-i18n";
import { APIChat } from "../lib/chatSchema";
import {
  autoResizeTextarea,
  resetTextareaSize,
} from "../lib/autoResizeTextarea";
import { getResponseFromAPIRequest } from "../lib/apiRequest";
import { discordEmoji, Emoji } from "../lib/discordEmoji";
import { getReply } from "../lib/getReply";
import { postSchema } from "../lib/postSchema";
import { useCloudlinkStore } from "../stores/cloudlink";
import { useLoginStatusStore } from "../stores/loginStatus";
import { useSettingsStore } from "../stores/settings";

const { chat } = defineProps<{
  chat?: APIChat;
}>();

const cloudlinkStore = useCloudlinkStore();
const loginStatusStore = useLoginStatusStore();
const settingsStore = useSettingsStore();
const { t } = useI18n();

const postContent = ref("");
const posting = ref(false);

const post = async (e?: Event) => {
  e?.preventDefault();
  if (posting.value) {
    return;
  }
  posting.value = true;
  console.log(chat ? chat._id : "livechat");
  const response = await getResponseFromAPIRequest(
    chat ? `/posts/${chat._id}` : "/home",
    {
      method: "POST",
      auth: loginStatusStore,
      body: JSON.stringify({
        content: postContent.value,
      }),
      schema: postSchema,
    },
  );
  if ("status" in response) {
    alert(t("postFail", { status: response.status }));
    posting.value = false;
    return;
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
  if (e.key === "Enter" && settingsStore.enterSends) {
    if (!e.shiftKey) {
      e.preventDefault();
      post();
    }
  }
};

const addEmoji = (emoji: Emoji) => {
  if (!inputRef.value) {
    return;
  }
  postContent.value =
    inputRef.value.value.slice(0, inputRef.value.selectionStart) +
    emoji.emoji +
    inputRef.value.value.slice(inputRef.value.selectionEnd);
};

defineExpose({ reply });
</script>

<template>
  <form @submit="post" class="flex gap-2">
    <textarea
      class="w-full resize-none rounded-lg bg-slate-800 px-2 py-1"
      :placeholder="$t('enterPostPlaceholder')"
      @input="input"
      @keydown="keydown"
      v-model="postContent"
      ref="inputRef"
      rows="1"
    ></textarea>
    <Popover.Root :positioning="{ placement: 'bottom' }">
      <Popover.Trigger class="rounded-xl bg-slate-800 px-2 py-1">
        <IconMoodHappy aria-hidden />
        <span class="sr-only">Emoji</span>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content
          class="z-10 max-w-60 rounded-lg bg-slate-800 px-2 py-1 shadow-lg"
        >
          <strong>{{ t("chooseEmoji") }}</strong>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              @click="addEmoji(emoji)"
              v-for="emoji in discordEmoji"
            >
              <img
                :src="`https://cdn.discordapp.com/emojis/${emoji.id}.${
                  emoji.isGif ? 'gif' : 'webp'
                }?size=24&quality=lossless`"
                :alt="emoji.name"
                :title="emoji.name"
              />
            </button>
          </div>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
    <button type="submit" class="text-nowrap rounded-xl bg-slate-800 px-2 py-1">
      {{ $t("enterPostSend") }}
    </button>
  </form>
</template>
