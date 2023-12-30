import { defineStore } from "pinia";

export type Location = "home" | "group" | "inbox" | "settings";
export const useLocationStore = defineStore("location", {
  state: (): { location: Location } => ({ location: "home" }),
});
