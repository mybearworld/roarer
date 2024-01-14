import { effect, ref } from "vue";
import { defineStore } from "pinia";

const ANY_IMG_HOST_STORAGE = "roarer:anyImageHost";
const FILTER_SWEARS_STORAGE = "roarer:filterSwears";

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
  const filterSwears = ref(
    ["true", null].includes(localStorage.getItem(FILTER_SWEARS_STORAGE)),
  );
  effect(() => {
    localStorage.setItem(
      FILTER_SWEARS_STORAGE,
      filterSwears.value ? "true" : "false",
    );
  });

  return { anyImageHost, filterSwears };
});
