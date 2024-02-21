<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import Post from "../Post.vue";
import { getResponseFromAPIRequest } from "../../lib/apiRequest";
import { postSchema, APIPost } from "../../lib/postSchema";

const route = useRoute();
const { t } = useI18n();

const post = ref<APIPost | number | null>(null);
(async () => {
  const response = await getResponseFromAPIRequest(
    `/posts?id=${route.params.post}`,
    {
      schema: postSchema,
    },
  );
  if ("status" in response) {
    post.value = response.status;
  } else {
    post.value = response;
  }
})();
</script>

<template>
  <div v-if="typeof post === 'number'">
    {{ t("getPostFail", { status: post }) }}
  </div>
  <div v-else-if="!post">
    {{ t("loadingPost") }}
  </div>
  <div class="space-y-2" v-else>
    <Post :post="post" hide-controls />
    <RouterLink class="block text-link underline" to="/home">
      {{ t("backToHome") }}
    </RouterLink>
  </div>
</template>
