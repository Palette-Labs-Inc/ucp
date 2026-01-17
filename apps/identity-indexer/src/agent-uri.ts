import { z } from "zod";

const AgentBusinessSchema = z.object({
  name: z.string().min(1),
  domain: z.string().min(1),
  ucpProfileUrl: z.string().url()
});

export const AgentUriSchema = z.object({
  agentRegistry: z.string().optional(),
  agentId: z.union([z.string(), z.number()]).optional(),
  business: AgentBusinessSchema
});

export type AgentUri = z.infer<typeof AgentUriSchema>;
