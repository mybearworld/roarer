<script setup lang="ts">
import { ref } from "vue";
import EnterPost from "./EnterPost.vue";
import TypingIndicator from "./TypingIndicator.vue";
import OnlineList from "./OnlineList.vue";
import Post from "./Post.vue";
import { useCloudlinkStore } from "../stores/cloudlink";
import { useLoginStatusStore } from "../stores/loginStatus";
import { getResponseFromAPIRequest } from "../lib/apiRequest";
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
  ? `/posts/${chat._id}?autoget=1`
  : `/${inbox ? "inbox" : "home"}?autoget=1`;

const posts = ref<APIPost[]>([]);
const newPostsAmount = ref(0);
const pagesAmount = ref(1);

const postsSchema = z.object({
  autoget: postSchema.array(),
});
(async () => {
  const response = await getResponseFromAPIRequest(requestURL, {
    auth: loginStatusStore,
    schema: postsSchema,
  });
  if ("status" in response) {
    alert("Failed to get posts.");
    return;
  }
  posts.value = postsSchema.parse(response).autoget;

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
  const pagesToSkip = Math.floor(newPostsAmount.value / POSTS_PER_REQUESTS);
  const postsToRemove =
    newPostsAmount.value >= 0
      ? newPostsAmount.value % POSTS_PER_REQUESTS
      : POSTS_PER_REQUESTS -
        Math.abs(newPostsAmount.value % POSTS_PER_REQUESTS);
  const page = pagesAmount.value + pagesToSkip + 1;
  const response = await getResponseFromAPIRequest(
    requestURL + `&page=${page}`,
    {
      auth: loginStatusStore,
      schema: postsSchema,
    },
  );
  if ("status" in response) {
    alert(`Couldn't load more: ${response.status}`);
    return;
  }
  const newPosts = response.autoget.slice(postsToRemove);
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
