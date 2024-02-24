import { z } from "zod";

export const updateChatSchema = z.object({
  cmd: z.literal("direct"),
  val: z.object({
    mode: z.literal("update_chat"),
    payload: z.object({
      _id: z.string(),
      nickname: z.string().optional(),
      owner: z.string().optional(),
      members: z.string().array().optional(),
    }),
  }),
});
