import { ref } from "vue";
import { defineStore } from "pinia";

export const useMarkdownIdsStore = defineStore("markdownIds", () => {
  const latestId = ref(0);
  const getNewId = () => {
    latestId.value = latestId.value + 1;
    return `_markdown-id-${latestId.value + 1}`;
  };

  return { getNewId };
});
