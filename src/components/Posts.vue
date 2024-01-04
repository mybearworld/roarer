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

const POSTS_PER_REQUESTS = 25;
const requestURL = chat
  ? `https://api.meower.org/posts/${chat._id}?autoget=1`
  : `https://api.meower.org/${inbox ? "inbox" : "home"}?autoget=1`;

const posts = ref<APIPost[]>([]);
const newPostsAmount = ref(0);
const pagesAmount = ref(1);

const postsSchema = z.object({
  autoget: postSchema.array(),
});
(async () => {
  const { username, token } = loginStatusStore;
  if (username === null || token === null) {
    return;
  }
  const request = await (
    await fetch(requestURL, {
      headers: {
        username,
        token,
      },
    })
  ).json();
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
        newPostsAmount.value++;
      },
      false,
    );
  }
})();

const enterPost = ref<InstanceType<typeof EnterPost> | null>(null);

const loadingMore = ref(false);
const loadMore = async () => {
  if (loadingMore.value) {
    return;
  }
  loadingMore.value = true;
  const { username, token } = loginStatusStore;
  if (username === null || token === null) {
    loadingMore.value = false;
    return;
  }
  const pagesToSkip = Math.floor(newPostsAmount.value / POSTS_PER_REQUESTS);
  const postsToRemove =
    newPostsAmount.value >= 0
      ? newPostsAmount.value % POSTS_PER_REQUESTS
      : POSTS_PER_REQUESTS -
        Math.abs(newPostsAmount.value % POSTS_PER_REQUESTS);
  const page = pagesAmount.value + pagesToSkip + 1;
  const request = await (
    await fetch(requestURL + `&page=${page}`, {
      headers: {
        username,
        token,
      },
    })
  ).json();
  const safeRequest = postsSchema.parse(request);
  const newPosts = safeRequest.autoget.slice(postsToRemove);
  posts.value.push(...newPosts);
  pagesAmount.value = page;
  newPostsAmount.value += newPosts.length;
  loadingMore.value = false;
};
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
    @delete="newPostsAmount--"
    v-for="post in posts"
  />
  <button
    type="button"
    class="w-full rounded-xl bg-slate-800 py-1"
    :disabled="loadingMore"
    @click="loadMore"
  >
    {{ loadingMore ? "Loading more..." : "Load more" }}
  </button>
</template>
