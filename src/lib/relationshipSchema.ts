import { z } from "zod";

export type APIRelationship = z.infer<typeof relationshipSchema>;
export const relationshipSchema = z.object({
  state: z.literal(0).or(z.literal(2)),
  updated_at: z.number().nullable(),
});
export const individualRelationshipPacketSchema = relationshipSchema.and(
  z.object({
    username: z.string(),
  }),
);
export const relationshipPacketSchema = z.object({
  cmd: z.literal("direct"),
  val: z.object({
    mode: z.literal("update_relationship"),
    payload: individualRelationshipPacketSchema,
  }),
});
