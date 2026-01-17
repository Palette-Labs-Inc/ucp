import { EnvSchema } from "@ucp/config";
import { z } from "zod";

const IndexerEnvSchema = EnvSchema.extend({
  IDXS_URL: z.string().url().optional(),
  IDXS_API_KEY: z.string().min(1).optional(),
  INDEXER_PORT: z.coerce.number().int().positive().default(4000),
  INDEXER_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(3000),
  INDEXER_FETCH_TIMEOUT_MS: z.coerce.number().int().positive().default(8000),
  INDEXER_BATCH_SIZE: z.coerce.number().int().positive().default(100)
});

export type IndexerEnv = z.infer<typeof IndexerEnvSchema>;

export const env: IndexerEnv = IndexerEnvSchema.parse(process.env);
