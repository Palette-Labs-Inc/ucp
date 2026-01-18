import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

import { repoRoot } from "../path-utils/index.js";

const rootDir = repoRoot();

function loadRootEnv(): void {
  const envPaths = [resolve(rootDir, ".env"), resolve(rootDir, ".env.local")];

  for (const envPath of envPaths) {
    if (!existsSync(envPath)) continue;
    loadEnv({ path: envPath, override: true });
  }
}

loadRootEnv();

export const EnvSchema = z.object({
  // infra
  RPC_URL: z.string().min(1),
  CHAIN_ID: z.coerce.number().int().positive().default(31337),

  // shovel
  DATABASE_URL: z.string().min(1),
  SHOVEL_START_BLOCK: z.coerce.number().int().min(0).default(0),
});

export interface Env extends z.infer<typeof EnvSchema> {}

export const env: Env = EnvSchema.parse(process.env);
