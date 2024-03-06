import { reactive, ref } from "vue";
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
    if (username in map) {
      return map[username];
    }
    const profile = await getResponseFromAPIRequest(`/users/${username}`, {
      schema: profileSchema,
    });
    if ("status" in profile) {
      throw new Error(`Couldn't get profile: ${profile.status}`);
    }
    const reactiveProfile = reactive(profile);
    map[username] = reactiveProfile;
    return map[username];
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
      console.log("here!");
      map[packet.val.payload._id] = {
        ...map[packet.val.payload._id],
        ...packet.val.payload,
      };
    },
    false,
  );

  getUser("PKW");

  return { map, getUser };
});
