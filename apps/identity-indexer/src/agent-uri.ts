import { z } from "zod";

const AgentBusinessSchema = z.object({
  name: z.string().min(1).optional(),
  domain: z.string().min(1),
  ucpProfileUrl: z.string().url()
});

export const AgentUriSchema = z.object({
  business: AgentBusinessSchema
});

export type AgentUri = z.infer<typeof AgentUriSchema>;
