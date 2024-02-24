import { ref } from "vue";
import { defineStore } from "pinia";
import { useCloudlinkStore } from "./cloudlink";
import { relationshipPacketSchema } from "../lib/schemas/relationship";

export const useRelationshipStore = defineStore("relationshipStore", () => {
  const blockedUsers = ref(new Set<string>());

  // see cloudlink.ts for the logic of adding and removing blocked users, it
  // can't be here because that would lead to circular dependencies

  return { blockedUsers };
});
