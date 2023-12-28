<script setup lang="ts">
import { ref } from "vue";
import EnterPost from "../EnterPost.vue";
import Header from "../Header.vue";
import TypingIndicator from "../TypingIndicator.vue";
import OnlineList from "../OnlineList.vue";
import Post from "../Post.vue";
import { useCloudlinkStore } from "../../stores/cloudlink";
import { postSchema } from "../../lib/postSchema";
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
    <Header title="Home" />
    <OnlineList />
    <EnterPost ref="enterPost" />
    <TypingIndicator />
    <Post
      :post="post"
      :key="post.post_id"
      @reply="enterPost?.reply"
      v-for="post in homePosts"
    />
  </div>
</template>
