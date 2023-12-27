<script setup lang="ts">
import { ref } from "vue";
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
</script>

<template>
  <EnterPost />
  <div class="space-y-2">
    <Post :post="post" v-for="post in homePosts" />
  </div>
</template>
