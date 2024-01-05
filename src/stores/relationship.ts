import { ref } from "vue";
import { defineStore } from "pinia";
import { z } from "zod";
import { useCloudlinkStore } from "./cloudlink";
import {
  relationshipPacketSchema,
  individualRelationshipPacketSchema,
} from "../lib/relationshipSchema";

export const useRelationshipStore = defineStore("relationshipStore", () => {
  const blockedUsers = ref(new Set<string>());

  const cloudlinkStore = useCloudlinkStore();
  cloudlinkStore.lookFor(
    relationshipPacketSchema,
    (packet) => {
      if (packet.val.payload.state === 0) {
        blockedUsers.value.delete(packet.val.payload.username);
        blockedUsers.value = blockedUsers.value;
      } else {
        blockedUsers.value.add(packet.val.payload.username);
        blockedUsers.value = blockedUsers.value;
      }
    },
    false,
  );

  return { blockedUsers };
});
