import { defineStore } from "pinia";

export const useIsDevStore = defineStore("isDev", {
  state: () => ({ isDev: import.meta.env.DEV }),
});
