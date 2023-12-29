import { defineStore } from "pinia";

export type Location = "home" | "group" | "inbox";
export const useLocationStore = defineStore("location", {
  state: (): { location: Location } => ({ location: "home" }),
});
