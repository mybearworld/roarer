import { z } from "zod";

export type APIPost = z.infer<typeof postSchema>;
export const postSchema = z.object({
  edited_at: z.number().optional(),
  isDeleted: z.boolean(),
  p: z.string(),
  post_id: z.string(),
  post_origin: z.string(),
  t: z.object({
    d: z.string(),
    e: z.number(),
    h: z.string(),
    mi: z.string(),
    mo: z.string(),
    s: z.string(),
    y: z.string(),
  }),
  type: z.number(),
  u: z.string(),
  unfiltered_p: z.string().optional(),
});
