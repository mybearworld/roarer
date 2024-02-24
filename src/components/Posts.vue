<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";
import EnterPost from "./EnterPost.vue";
import TypingIndicator from "./TypingIndicator.vue";
import OnlineList from "./OnlineList.vue";
import Post from "./Post.vue";
import { useCloudlinkStore } from "../stores/cloudlink";
import { useLoginStatusStore } from "../stores/loginStatus";
import { useRelationshipStore } from "../stores/relationship";
import { useSettingsStore } from "../stores/settings";
import { getResponseFromAPIRequest } from "../lib/apiRequest";
import { APIChat } from "../lib/schemas/chat";
import { postSchema, APIPost } from "../lib/schemas/post";
import { z } from "zod";

const { chat, inbox } = defineProps<{
  chat?: APIChat;
  inbox?: boolean;
}>();

const cloudlinkStore = useCloudlinkStore();
const loginStatusStore = useLoginStatusStore();
const relationshipStore = useRelationshipStore();
const settingsStore = useSettingsStore();
const { t } = useI18n();

const POSTS_PER_REQUESTS = 25;
const requestURL = chat
  ? `/posts/${chat._id}?autoget=1`
  : `/${inbox ? "inbox" : "home"}?autoget=1`;

const posts = ref<APIPost[]>([]);
const gotPosts = ref(false);
const newPostsAmount = ref(0);
const stopShowingLoadMore = ref(false);

const showPosts = computed(() =>
  posts.value.filter(
    (post) =>
      !settingsStore.hideBlockedMentions ||
      ![...relationshipStore.blockedUsers].some((user) =>
        post.p.toLowerCase().includes(`@${user.toLowerCase()}`),
      ),
  ),
);

const postsSchema = z.object({
  autoget: postSchema.array(),
  pages: z.number(),
});
(async () => {
  const response = await getResponseFromAPIRequest(requestURL, {
    auth: true,
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
  newPostsAmount.value = 25;
  gotPosts.value = true;
})();

const enterPost = ref<InstanceType<typeof EnterPost> | null>(null);

const loadingMore = ref(false);
const loadMore = async () => {
  if (loadingMore.value) {
    return;
  }
  loadingMore.value = true;
  const page =
    newPostsAmount.value < 1
      ? 1
      : Math.floor(newPostsAmount.value / POSTS_PER_REQUESTS) + 1;
  const postsToRemove =
    newPostsAmount.value <= -25
      ? 0
      : newPostsAmount.value < 0
        ? POSTS_PER_REQUESTS + (newPostsAmount.value % POSTS_PER_REQUESTS)
        : newPostsAmount.value % POSTS_PER_REQUESTS;
  const response = await getResponseFromAPIRequest(
    requestURL + `&page=${page}`,
    {
      auth: true,
      schema: postsSchema,
    },
  );
  if ("status" in response) {
    alert(t("loadMoreFail", { status: response.status }));
    return;
  }
  const newPosts = response.autoget.slice(postsToRemove);
  posts.value.push(...newPosts);
  newPostsAmount.value += newPosts.length;
  loadingMore.value = false;
  stopShowingLoadMore.value = response.pages === page;
};
</script>

<template>
  <div class="flex items-center gap-2" v-if="chat">
    <h2 class="text-lg font-bold" v-if="chat">
      {{
        chat.nickname ||
        chat.members.find((member) => member !== loginStatusStore.username)
      }}
    </h2>
    <RouterLink to="/chats" class="text-link underline">
      {{ t("back") }}
    </RouterLink>
  </div>
  <OnlineList :chat="chat" v-if="!inbox" />
  <EnterPost
    ref="enterPost"
    :chat="chat"
    v-if="!inbox && loginStatusStore.isLoggedIn"
  />
  <TypingIndicator :chat="chat" v-if="!inbox" />
  <Post
    :post="post"
    :key="post.post_id"
    :inbox="inbox"
    :isChatOwner="chat && chat.owner === loginStatusStore.username"
    @reply="enterPost?.reply"
    @delete="newPostsAmount--"
    v-for="post in showPosts"
  />
  <button
    type="button"
    class="w-full rounded-xl bg-accent py-1 text-accent-text"
    :disabled="loadingMore"
    @click="loadMore"
    v-if="!stopShowingLoadMore && gotPosts"
  >
    {{ loadingMore ? t("loadingMore") : t("loadMore") }}
  </button>
</template>
../lib/schemas/chatSchema ../lib/schemas/post
