<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
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
const emit = defineEmits<{
  back: [];
}>();

const cloudlinkStore = useCloudlinkStore();
const loginStatusStore = useLoginStatusStore();
const { t } = useI18n();

const POSTS_PER_REQUESTS = 25;
const requestURL = chat
  ? `/posts/${chat._id}?autoget=1`
  : `/${inbox ? "inbox" : "home"}?autoget=1`;

const posts = ref<APIPost[]>([]);
const newPostsAmount = ref(0);
const pagesAmount = ref(1);
const stopShowingLoadMore = ref(false);

const postsSchema = z.object({
  autoget: postSchema.array(),
  pages: z.number(),
});
(async () => {
  const response = await getResponseFromAPIRequest(requestURL, {
    auth: loginStatusStore,
    schema: postsSchema,
  });
  if ("status" in response) {
    alert(t("getPostsFail", { status: response.status }));
    return;
  }
  posts.value = response.autoget;
  stopShowingLoadMore.value = response.pages === 1;

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
    alert(t("loadMoreFail", { status: response.status }));
    return;
  }
  const newPosts = response.autoget.slice(postsToRemove);
  posts.value.push(...newPosts);
  pagesAmount.value = page;
  newPostsAmount.value += newPosts.length;
  loadingMore.value = false;
  stopShowingLoadMore.value = response.pages === page;
};
</script>

<template>
  <div class="flex items-center gap-2" v-if="chat">
    <h2 class="text-lg font-bold" v-if="chat">{{ chat.nickname }}</h2>
    <button class="text-sky-400 underline" @click="emit('back')">
      {{ t("back") }}
    </button>
  </div>
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
    v-if="!stopShowingLoadMore"
  >
    {{ loadingMore ? t("loadingMore") : t("loadMore") }}
  </button>
</template>
