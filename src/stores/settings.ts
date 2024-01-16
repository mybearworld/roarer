import { effect, ref } from "vue";
import { defineStore } from "pinia";

const ANY_IMG_HOST_STORAGE = "roarer:anyImageHost";
const FILTER_SWEARS_STORAGE = "roarer:filterSwears";
const ENTER_SENDS_STORAGE = "roarer:enterSends";

export const useSettingsStore = defineStore("settings", () => {
  const anyImageHost = ref(
    localStorage.getItem(ANY_IMG_HOST_STORAGE) === "true",
  );
  const filterSwears = ref(
    ["true", null].includes(localStorage.getItem(FILTER_SWEARS_STORAGE)),
  );
  const enterSends = ref(
    ["true", null].includes(localStorage.getItem(ENTER_SENDS_STORAGE)),
  );

  effect(() => {
    localStorage.setItem(
      ANY_IMG_HOST_STORAGE,
      anyImageHost.value ? "true" : "false",
    );
  });
  effect(() => {
    localStorage.setItem(
      FILTER_SWEARS_STORAGE,
      filterSwears.value ? "true" : "false",
    );
  });
  effect(() => {
    localStorage.setItem(
      ENTER_SENDS_STORAGE,
      enterSends.value ? "true" : "false",
    );
  });

  return { anyImageHost, filterSwears, enterSends };
});
