import { loadEnvFiles } from "@ucp/config/env";
import { BaseEnvSchema } from "@ucp/config/env/schema";
import { appRootFromCwd, repoRoot } from "@ucp/config/path";
import { z } from "zod";

const repoRootDir = repoRoot();
const appRoot = appRootFromCwd({ appPath: "apps/identity-indexer" });
loadEnvFiles({ repoRoot: repoRootDir, appRoot });

const IndexerEnvSchema = BaseEnvSchema.extend({
  DATABASE_URL: z.string().min(1),
  SHOVEL_START_BLOCK: z.coerce.number().int().min(0).default(0),
  INDEXER_PORT: z.coerce.number().int().positive().default(4000),
  INDEXER_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(3000),
  INDEXER_FETCH_TIMEOUT_MS: z.coerce.number().int().positive().default(8000),
  INDEXER_BATCH_SIZE: z.coerce.number().int().positive().default(100),
});

export interface IndexerEnv extends z.infer<typeof IndexerEnvSchema> {}

export const env: IndexerEnv = IndexerEnvSchema.parse(process.env);
