<script setup lang="ts">
import { z } from "zod";
import { useCloudlinkStore } from "../stores/cloudlink";
import { postSchema } from "../lib/postSchema";

const { post } = defineProps<{
  post: z.infer<typeof postSchema>;
}>();
</script>

<template>
  <div class="flex flex-col rounded-xl bg-slate-800 px-2 py-1">
    <div>
      <span class="font-bold">{{ post.u }}</span>
    </div>
    {{ post.p }}
  </div>
</template>
