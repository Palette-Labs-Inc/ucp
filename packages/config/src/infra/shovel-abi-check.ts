import { resolve } from "node:path";
import { AbiEvent } from "ox";
import type { AbiEvent as AbiTypeEvent } from "abitype";
import {
  assertDeployArtifacts,
  getEventAndStoreMap,
  loadAbiEvents,
  loadContracts,
} from "./shovel-utils.js";
import { env } from "@ucp/config/env";
import type { ContractConfig } from "./shovel-utils.js";

function parseArgs(): string[] {
  const args = process.argv.slice(2);
  return args[0] === "--" ? args.slice(1) : args;
}

function checkContract(contract: ContractConfig): void {
  const abiEvents = loadAbiEvents(contract.abi).map((event: AbiTypeEvent) =>
    AbiEvent.from(event),
  );
  if (abiEvents.filter((event) => event.name === contract.event.name).length === 0) {
    throw new Error(
      `Event ${contract.event.name} not found in ABI: ${contract.abi}`,
    );
  }
  if (abiEvents.filter((event) => event.name === contract.event.name).length > 1) {
    throw new Error(
      `Event ${contract.event.name} is overloaded in ABI: ${contract.abi}`,
    );
  }

  assertDeployArtifacts({
    abiPath: contract.abi,
    chainId: env.CHAIN_ID,
    deploy: contract.deploy,
  });

  getEventAndStoreMap({
    abiPath: contract.abi,
    eventName: contract.event.name,
    store: contract.event.store,
  });
}

function main(): void {
  const [contractsFile] = parseArgs();
  if (!contractsFile) {
    throw new Error("Usage: shovel-abi-check.ts <contracts-config>");
  }

  const contractsPath = resolve(contractsFile);
  const contracts = loadContracts(contractsPath);

  for (const contract of contracts) {
    checkContract(contract);
    console.log(`OK: ${contract.name}`);
  }
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
}
