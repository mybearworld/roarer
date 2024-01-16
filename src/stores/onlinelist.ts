import { ref } from "vue";
import { defineStore } from "pinia";
import { z } from "zod";
import { useCloudlinkStore } from "./cloudlink";

export const useOnlinelistStore = defineStore("onlinelist", () => {
  const cloudlinkStore = useCloudlinkStore();

  const online = ref<string[]>(
    cloudlinkStore.cloudlink.ulist
      ? // the type of ulist is phenomenally awful
        (cloudlinkStore.cloudlink.ulist as unknown as string)
          .slice(0, -1)
          .split(";")
      : [],
  );

  cloudlinkStore.cloudlink.on("ulist", (packet: unknown) => {
    const newOnline = z.object({ val: z.string() }).parse(packet);
    online.value = newOnline.val.split(";").slice(0, -1);
  });

  return { online };
});
