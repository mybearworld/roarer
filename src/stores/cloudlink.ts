import { defineStore } from "pinia";
import CloudlinkClient from "@williamhorning/cloudlink";

const cloudlink = new CloudlinkClient({
  url: "wss://api.meower.org/v0/cloudlink",
  log: import.meta.env.DEV,
});
export const useCloudlinkStore = defineStore("cloudlink", {
  state: () => ({ cloudlink }),
});
