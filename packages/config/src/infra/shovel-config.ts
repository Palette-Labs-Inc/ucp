import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import shovelConfig from "@indexsupply/shovel-config";
import type {
  Integration,
  PGColumnType,
  Source,
  Table,
} from "@indexsupply/shovel-config";
import {
  columnType,
  ensureLowercase,
  ensureUnique,
  getEventAndStoreMap,
  loadContracts,
  parseArgs,
  requireDeployAddressNo0xLower,
  requireBigInt,
  toSnakeCase,
} from "./shovel-utils.js";
import { env } from "@ucp/config/env";

import type { ContractConfig } from "./shovel-utils.js";

function buildConfig(contracts: ContractConfig[]): string {
  const pgUrl = env.SHOVEL_PG_URL;

  const chainId = env.CHAIN_ID;
  const ethRpcUrl = env.ETH_RPC_URL ?? env.ANVIL_RPC_URL;

  const source: Source = {
    name: "local",
    chain_id: chainId,
    url: ethRpcUrl,
    urls: [ethRpcUrl],
  };

  const integrations: Integration[] = contracts.map((contract) => {
    const addressValue = requireDeployAddressNo0xLower({
      abiPath: contract.abi,
      chainId,
      deploy: contract.deploy,
    });

    const startBlock = requireBigInt(contract.env.start_block);
    const { parsedEvent, storedInputs } = getEventAndStoreMap({
      abiPath: contract.abi,
      eventName: contract.event.name,
      store: contract.event.store,
    });

    ensureLowercase("table name", contract.table.name);
    ensureLowercase("address column", contract.table.address_column);

    const baseColumns: Array<{ name: string; type: PGColumnType }> = [
      { name: "chain_id", type: "numeric" },
      { name: "block_num", type: "numeric" },
      { name: "tx_hash", type: "bytea" },
      { name: "log_idx", type: "numeric" },
      { name: contract.table.address_column, type: "bytea" },
    ];

    const columnNames = new Set<string>(baseColumns.map((column) => column.name));

    const eventColumns: Array<{ name: string; type: PGColumnType }> = [];
    const eventInputs: Array<{
      indexed: boolean;
      name: string;
      type: string;
      column: string;
    }> = [];

    for (const input of storedInputs) {
      const columnName = toSnakeCase(input.column);
      ensureLowercase("column name", columnName);
      ensureUnique(columnName, columnNames);

      eventColumns.push({ name: columnName, type: columnType(input.type) });
      eventInputs.push({
        indexed: Boolean(input.indexed),
        name: input.name,
        type: input.type,
        column: columnName,
      });
    }

    const table: Table = {
      name: contract.table.name,
      columns: [...baseColumns, ...eventColumns],
    };

    return {
      name: contract.name,
      enabled: true,
      sources: [{ name: source.name, start: startBlock }],
      table,
      block: [
        { name: "chain_id", column: "chain_id" },
        { name: "block_num", column: "block_num" },
        { name: "tx_hash", column: "tx_hash" },
        { name: "log_idx", column: "log_idx" },
        {
          name: "log_addr",
          column: contract.table.address_column,
          filter_op: "contains",
          filter_arg: [addressValue],
        },
      ],
      event: {
        type: "event",
        name: parsedEvent.name,
        anonymous: Boolean(parsedEvent.anonymous),
        inputs: eventInputs,
      },
    } as Integration;
  });

  const config = shovelConfig.makeConfig({
    pg_url: pgUrl,
    sources: [source],
    integrations,
  });

  return shovelConfig.toJSON(config);
}

async function main(): Promise<void> {
  const [envFile, contractsFile, outputFile] = parseArgs();

  if (!envFile || !contractsFile || !outputFile) {
    throw new Error(
      "Usage: generate_shovel_config.ts <env-file> <contracts-config> <output>",
    );
  }

  const envPath = resolve(envFile);
  const contractsPath = resolve(contractsFile);
  const outputPath = resolve(outputFile);

  loadEnv({ path: envPath });

  const contracts = loadContracts(contractsPath);

  const configJson = buildConfig(contracts);
  writeFileSync(outputPath, configJson + "\n");
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
