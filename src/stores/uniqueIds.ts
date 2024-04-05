import { ref } from "vue";
import { defineStore } from "pinia";

export const useIdsStore = defineStore("ids", () => {
  return {
    newMarkdownId: createSet("markdown"),
    newOptimisicPostId: createSet("optimisticPost"),
  };
});

const createSet = (name: string) => {
  const latestId = ref(0);
  return () => `_${name}-id-${latestId.value++}`;
};
