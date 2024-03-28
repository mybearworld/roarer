import { z } from "zod";

export const profileSchemaNoError = z.object({
  _id: z.string(),
  avatar: z.string(),
  avatar_color: z.string(),
  banned: z.boolean(),
  created: z.number().nullable(),
  flags: z.number(),
  last_seen: z.number().nullable(),
  lower_username: z.string(),
  lvl: z.number(),
  permissions: z.number().nullable(),
  pfp_data: z.number().nullable(),
  quote: z.string().nullable(),
  uuid: z.string().nullable(),
});
export type APIProfile = z.infer<typeof profileSchema>;
export const profileSchema = profileSchemaNoError.and(
  z.object({
    error: z.literal(false),
  }),
);
export type APIProfileOrError = z.infer<typeof profileSchemaOrError>;
export const profileSchemaOrError = profileSchema.or(
  z.object({
    error: z.literal(true),
    type: z.string(),
  }),
);
