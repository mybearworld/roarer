import { defineStore } from "pinia";

export const useLoginStatusStore = defineStore("loginStatus", {
  state: () => ({ username: null as null | string }),
});
