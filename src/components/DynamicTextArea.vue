<script setup lang="ts">
import { ref, watch } from "vue";

const model = defineModel<string>();
const el = ref<HTMLTextAreaElement>();

watch([model], () => {
  console.log("!");
  requestAnimationFrame(() => {
    if (!el.value) return;
    el.value.style.height = "auto";
    el.value.style.height = `${el.value.scrollHeight + 4}px`;
  });
});
</script>

<template>
  <textarea
    class="w-full resize-none rounded-lg border-2 border-accent bg-transparent px-2 py-1"
    rows="1"
    v-model="model"
    ref="el"
  ></textarea>
</template>
