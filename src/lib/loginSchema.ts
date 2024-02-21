import { z } from "zod";
import { individualRelationshipPacketSchema } from "./relationshipSchema";

export const loginSchema = z.object({
  mode: z.literal("auth"),
  payload: z.object({
    username: z.string(),
    token: z.string(),
    relationships: individualRelationshipPacketSchema.array(),
  }),
});
