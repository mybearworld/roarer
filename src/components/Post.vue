<script setup lang="ts">
import { z } from "zod";
import { useCloudlinkStore } from "../stores/cloudlink";
import { postSchema } from "../lib/postSchema";

const { post } = defineProps<{
  post: z.infer<typeof postSchema>;
}>();
</script>

<template>
  <div>
    <div>
      {{ post.u }}
    </div>
    {{ post.p }}
  </div>
</template>
