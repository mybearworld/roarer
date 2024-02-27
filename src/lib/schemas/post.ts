import { z } from "zod";

export type APIPost = z.infer<typeof postSchema>;
export const postSchema = z.object({
  edited_at: z.number().optional(),
  isDeleted: z.boolean(),
  p: z.string(),
  post_id: z.string(),
  post_origin: z.string(),
  t: z.object({
    e: z.number(),
  }),
  type: z.number(),
  u: z.string(),
  unfiltered_p: z.string().optional(),
});
