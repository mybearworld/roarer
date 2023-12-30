import { z } from "zod";

export type APIProfile = z.infer<typeof profileSchema>;
export const profileSchema = z.object({
  _id: z.string(),
  banned: z.boolean(),
  created: z.number(),
  flags: z.number(),
  error: z.literal(false),
  last_seen: z.number().nullable(),
  lower_username: z.string(),
  lvl: z.number(),
  permissions: z.number(),
  pfp_data: z.number(),
  quote: z.string(),
  uuid: z.string(),
});
export type APIProfileOrError = z.infer<typeof profileSchemaOrError>;
export const profileSchemaOrError = profileSchema.or(
  z.object({
    error: z.literal(true),
    type: z.string(),
  }),
);
