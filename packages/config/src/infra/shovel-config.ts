import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import shovelConfig from "@indexsupply/shovel-config";
import { shovelIntegrations } from "./shovel-integrations.js";
import type { EnvVars } from "./shovel-types.js";
import {
  buildEventIntegration,
  buildShovelSource,
  readDeployAddress,
} from "./shovel-utils.js";

function parseArgs(argv: string[] = process.argv.slice(2)): string[] {
  if (argv[0] === "--") return argv.slice(1);
  return argv;
}

function buildConfig(env: EnvVars): string {
  const source = buildShovelSource(env);
  const integrations = shovelIntegrations.map((contract) => {
    const registryAddress = readDeployAddress({
      chainId: env.CHAIN_ID,
      contractName: contract.contractName,
    });
    return buildEventIntegration({
      contract,
      registryAddress,
      startBlock: env.SHOVEL_START_BLOCK,
      sourceName: source.name,
    });
  });

  const config = shovelConfig.makeConfig({
    pg_url: env.SHOVEL_PG_URL,
    sources: [source],
    integrations,
  });

  return shovelConfig.toJSON(config, 2);
}

async function main(): Promise<void> {
  const [envFile, outputFile] = parseArgs();
  if (!envFile || !outputFile) {
    throw new Error(
      "Usage: shovel-config.ts <env-file> <output>",
    );
  }

  loadEnv({ path: resolve(envFile) });
  const { env } = (await import("../env.js")) as { env: EnvVars };

  if (shovelIntegrations.length === 0) {
    throw new Error("No shovel integrations configured.");
  }

  const configJson = buildConfig(env);
  writeFileSync(resolve(outputFile), configJson + "\n");
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
