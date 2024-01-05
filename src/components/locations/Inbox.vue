<script setup lang="ts">
import { useI18n } from "vue-i18n";
import Navigation from "../Navigation.vue";
import Posts from "../Posts.vue";

const { t } = useI18n();
</script>

<template>
  <div class="space-y-2">
    <Navigation :title="t('routeInbox')" />
    <Posts inbox />
  </div>
</template>
