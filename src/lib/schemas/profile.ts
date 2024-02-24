import { z } from "zod";

export const profileSchemaNoError = z.object({
  _id: z.string(),
  banned: z.boolean(),
  created: z.number(),
  flags: z.number(),
  last_seen: z.number().nullable(),
  lower_username: z.string(),
  lvl: z.number(),
  permissions: z.number(),
  pfp_data: z.number(),
  quote: z.string(),
  uuid: z.string(),
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
