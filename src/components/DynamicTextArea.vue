<script setup lang="ts">
import { effect, ref, watch } from "vue";
import { useSettingsStore } from "../stores/settings";

const settingsStore = useSettingsStore();

const model = defineModel<string>();
const el = ref<HTMLTextAreaElement>();

const resize = () => {
  requestAnimationFrame(() => {
    if (!el.value) return;
    el.value.style.height = "auto";
    el.value.style.height = `${el.value.scrollHeight + 4}px`;
  });
};

watch([model], () => {
  resize();
});

effect(() => {
  if (!el.value) return;
  resize();
});

const keydown = (e: KeyboardEvent) => {
  if (
    e.key === "Enter" &&
    ((!e.shiftKey && settingsStore.enterSends) ||
      (e.shiftKey && !settingsStore.enterSends)) &&
    el.value
  ) {
    e.preventDefault();
    el.value.form?.dispatchEvent(new Event("submit"));
  }
};

const focus = () => {
  if (!el.value) return;
  el.value.focus()
}

defineExpose({ focus })
</script>

<template>
  <textarea
    class="w-full resize-none rounded-lg border-2 bg-transparent px-2 py-1"
    rows="1"
    v-model="model"
    ref="el"
    @keydown="keydown"
  ></textarea>
</template>
