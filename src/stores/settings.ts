import { effect, ref } from "vue";
import { defineStore } from "pinia";

const ANY_IMG_HOST_STORAGE = "roarer:anyImageHost";

export const useSettingsStore = defineStore("settings", () => {
  const anyImageHost = ref(
    localStorage.getItem(ANY_IMG_HOST_STORAGE) === "true",
  );
  effect(() => {
    localStorage.setItem(
      ANY_IMG_HOST_STORAGE,
      anyImageHost.value ? "true" : "false",
    );
  });

  return { anyImageHost };
});
