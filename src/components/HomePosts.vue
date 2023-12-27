<script setup lang="ts">
import { ref, VNodeRef } from "vue";
import Login from "./Login.vue";
import EnterPost from "./EnterPost.vue";
import Post from "./Post.vue";
import { useCloudlinkStore } from "../stores/cloudlink";
import { postSchema } from "../lib/postSchema";
import { z } from "zod";

const cloudlinkStore = useCloudlinkStore();

const homePosts = ref<z.infer<typeof postSchema>[]>([]);

const homeSchema = z.object({
  autoget: postSchema.array(),
});
(async () => {
  homePosts.value = homeSchema.parse(
    await (await fetch("https://api.meower.org/home?autoget=1")).json(),
  ).autoget;

  const newPostSchema = z.object({
    cmd: z.literal("direct"),
    val: postSchema,
  });
  cloudlinkStore.lookFor(
    newPostSchema,
    ({ val: post }) => {
      homePosts.value.unshift(post);
      homePosts.value = homePosts.value;
    },
    false,
  );
})();

const enterPost = ref<InstanceType<typeof EnterPost> | null>(null);
</script>

<template>
  <div class="space-y-2">
    <div class="space-x-2">
      <h1 class="inline-block text-3xl font-bold">Roarer</h1>
      <Login />
    </div>
    <EnterPost ref="enterPost" />
    <Post
      :post="post"
      :key="post.post_id"
      @reply="enterPost?.reply"
      v-for="post in homePosts"
    />
  </div>
</template>
