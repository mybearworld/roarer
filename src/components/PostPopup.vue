<script setup lang="ts">
import { ref } from "vue";
import Post from "./Post.vue";
import { getResponseFromAPIRequest } from "../lib/apiRequest";
import { postSchema, APIPost } from "../lib/schemas/post";

const { post, inbox, isChatOwner } = defineProps<{
  post: string;
  inbox?: boolean;
  isChatOwner?: boolean;
}>();

const emit = defineEmits<{
  reply: [username: string, postContent: string, postId: string];
  delete: [];
  close: [];
}>();

const fetchedPost = ref<APIPost | null>(null);
(async () => {
  const response = await getResponseFromAPIRequest(`/posts?id=${post}`, {
    schema: postSchema,
    auth: true,
  });
  if (response.error !== null) {
    return;
  }
  fetchedPost.value = response.data;
})();
</script>

<template>
  <template v-if="fetchedPost">
    <div
      class="fixed left-0 top-0 h-full w-full bg-background opacity-40"
    ></div>
    <div
      class="fixed left-0 top-0 flex h-full w-full items-center justify-center"
    >
      <div class="w-[min(calc(100ch-8rem),95%)]">
        <Post
          :post="fetchedPost"
          :inbox="inbox"
          :isChatOwner="isChatOwner"
          closable
          @reply="
            (username, postContent, postId) =>
              emit('reply', username, postContent, postId)
          "
          @delete="emit('delete')"
          @close="emit('close')"
        />
      </div>
    </div>
  </template>
</template>
