<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";
import Login from "../Login.vue";

const { t } = useI18n();
</script>

<template>
  <div class="text-3xl font-bold">
    {{ t("loginRequiredHeader") }}
  </div>
  <p>{{ t("loginRequiredExplanation") }}</p>
  <p>{{ t("loginRequiredCta") }} <Login /></p>
  <p>
    {{ t("loginRequiredBack.start")
    }}<RouterLink to="/home" class="text-link underline">{{
      t("loginRequiredBack.link")
    }}</RouterLink
    >{{ t("loginRequiredBack.end") }}
  </p>
</template>
