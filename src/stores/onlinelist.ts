import { ref } from "vue";
import { defineStore } from "pinia";
import { z } from "zod";
import { useCloudlinkStore } from "./cloudlink";
import CloudlinkClient from "@williamhorning/cloudlink";

export const useOnlinelistStore = defineStore("onlinelist", () => {
  const online = ref<string[]>([]);

  const cloudlinkStore = useCloudlinkStore();
  cloudlinkStore.cloudlink.on("ulist", (packet: unknown) => {
    const newOnline = z.object({ val: z.string() }).parse(packet);
    online.value = newOnline.val.split(";").slice(0, -1);
  });

  return { online };
});
