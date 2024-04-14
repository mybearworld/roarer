import { reactive } from "vue";
import { defineStore } from "pinia";
import { z } from "zod";
import { useCloudlinkStore } from "./cloudlink";
import { getResponseFromAPIRequest } from "../lib/apiRequest";
import {
  profileSchema,
  profileSchemaNoError,
  APIProfile,
} from "../lib/schemas/profile";

export const useProfilesStore = defineStore("profiles", () => {
  const cloudlinkStore = useCloudlinkStore();

  const map = reactive<{ [k in string]: APIProfile }>({});

  const getUser = async (username: string) => {
    const current = map[username];
    if (current) {
      return current;
    }
    const profile = await getResponseFromAPIRequest(`/users/${username}`, {
      schema: profileSchema,
    });
    if (profile.error !== null) {
      throw new Error(`Couldn't get profile: ${profile.error}`);
    }
    const reactiveProfile = reactive(profile.data);
    map[username] = reactiveProfile;
    return reactiveProfile;
  };

  cloudlinkStore.lookFor(
    z.object({
      cmd: z.literal("direct"),
      val: z.object({
        mode: z.literal("update_profile"),
        payload: profileSchemaNoError.partial().and(
          z.object({
            _id: z.string(),
          }),
        ),
      }),
    }),
    (packet) => {
      if (!(packet.val.payload._id in map)) {
        return;
      }
      const current = map[packet.val.payload._id];
      if (!current) {
        return;
      }
      map[packet.val.payload._id] = {
        ...current,
        ...packet.val.payload,
      };
    },
    false,
  );

  getUser("PKW");

  return { map, getUser };
});
