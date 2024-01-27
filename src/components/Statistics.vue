<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { z } from "zod";
import { getResponseFromAPIRequest } from "../lib/apiRequest";

const { t } = useI18n();

const statsSchema = z.object({
  chats: z.number(),
  posts: z.number(),
  users: z.number(),
});

const stats = ref<z.infer<typeof statsSchema> | number | null>(null);
(async () => {
  const response = await getResponseFromAPIRequest("/statistics", {
    schema: statsSchema,
  });
  if ("status" in response) {
    stats.value = response.status;
    return;
  }
  stats.value = response;
})();
</script>

<template>
  <div>
    <div v-if="typeof stats === 'number'">
      {{ t("statsFail", { status: stats }) }}
    </div>
    <div v-else-if="!stats">{{ t("statsLoading") }}</div>
    <div v-else>
      {{ t("statsMessage", stats) }}
    </div>
    <p class="text-sm">{{ t("statsDontSpam") }}</p>
  </div>
</template>
