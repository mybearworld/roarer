import { defineStore } from "pinia";

export type Location = "home" | "group" | "inbox" | "settings" | "users";
export const useLocationStore = defineStore("location", {
  state: (): { location: Location; sublocation: null | string } => ({
    location: "home",
    sublocation: null,
  }),
});
