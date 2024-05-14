import { z } from "zod";

export type APIAttachment = z.infer<typeof attachmentSchema>;
const attachmentSchema = z.object({
  filename: z.string(),
  height: z.number(),
  id: z.string(),
  mime: z.string(),
  size: z.number(),
  width: z.number(),
});

export type APIPost = z.infer<typeof postSchema>;
export const postSchema = z.object({
  attachments: attachmentSchema.array(),
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
});
