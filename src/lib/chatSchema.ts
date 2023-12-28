import { z } from "zod";

export const chatSchema = z.object({
  created: z.number(),
  deleted: z.boolean(),
  last_active: z.number(),
  members: z.string().array(),
  nickname: z.string(),
  owner: z.string(),
  type: z.number(),
  _id: z.string(),
});
