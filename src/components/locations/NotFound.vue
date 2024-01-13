<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <div class="space-y-1 text-center">
    <h2 class="text-2xl font-bold">404</h2>
    <p>{{ t("message404") }}</p>
  </div>
</template>
