<script setup lang="ts">
import { ref } from "vue";
import EnterPost from "./EnterPost.vue";
import TypingIndicator from "./TypingIndicator.vue";
import OnlineList from "./OnlineList.vue";
import Post from "./Post.vue";
import { useCloudlinkStore } from "../stores/cloudlink";
import { useLoginStatusStore } from "../stores/loginStatus";
import { APIChat } from "../lib/chatSchema";
import { postSchema, APIPost } from "../lib/postSchema";
import { z } from "zod";

const { chat, inbox } = defineProps<{
  chat?: APIChat;
  inbox?: boolean;
}>();

const cloudlinkStore = useCloudlinkStore();
const loginStatusStore = useLoginStatusStore();

const posts = ref<APIPost[]>([]);

const postsSchema = z.object({
  autoget: postSchema.array(),
});
(async () => {
  const { username, token } = loginStatusStore;
  if (username === null || token === null) {
    return;
  }
  const request = await (
    await fetch(
      chat
        ? `https://api.meower.org/posts/${chat._id}?autoget=1`
        : `https://api.meower.org/${inbox ? "inbox" : "home"}?autoget=1`,
      {
        headers: {
          username,
          token,
        },
      },
    )
  ).json();
  console.log(request);
  posts.value = postsSchema.parse(request).autoget;

  const newPostSchema = z.object({
    cmd: z.literal("direct"),
    val: postSchema.and(
      z.object({
        post_origin: z.literal(chat?._id ?? "home"),
      }),
    ),
  });
  if (!inbox) {
    cloudlinkStore.lookFor(
      newPostSchema,
      ({ val: post }) => {
        posts.value.unshift(post);
        posts.value = posts.value;
      },
      false,
    );
  }
})();

const enterPost = ref<InstanceType<typeof EnterPost> | null>(null);
</script>

<template>
  <h2 class="text-lg font-bold" v-if="chat">{{ chat.nickname }}</h2>
  <OnlineList :chat="chat" v-if="!inbox" />
  <EnterPost ref="enterPost" :chat="chat" v-if="!inbox" />
  <TypingIndicator :chat="chat" v-if="!inbox" />
  <Post
    :post="post"
    :key="post.post_id"
    :inbox="inbox"
    @reply="enterPost?.reply"
    v-for="post in posts"
  />
</template>
