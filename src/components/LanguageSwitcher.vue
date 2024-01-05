<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { effect } from "vue";

const { t, locale, availableLocales, getLocaleMessage } = useI18n();

effect(() => {
  localStorage.setItem("roarer:locale", locale.value);
});
</script>

<template>
  <select class="rounded-xl bg-slate-800 px-2 py-1" v-model="locale">
    <option
      :value="locale"
      :selected="locale === locale"
      v-for="locale of availableLocales"
    >
      {{ getLocaleMessage(locale).languageName }}
    </option>
  </select>
</template>
