import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, isAbsolute, resolve } from "node:path";
import { AbiEvent, Address } from "ox";
import type { Abi, AbiEvent as AbiTypeEvent } from "abitype";
import type { PGColumnType } from "@indexsupply/shovel-config";

export interface ParsedEvent {
  name: string;
  anonymous: boolean;
  inputs: ReadonlyArray<{ name?: string; type: string; indexed?: boolean }>;
}

export interface ContractConfig {
  name: string;
  abi: string;
  table: { name: string; address_column: string };
  env: { start_block: string };
  deploy: { broadcast_path: string; contract_name: string };
  event: { name: string; store?: Record<string, string> };
}

export function parseArgs(argv: string[] = process.argv.slice(2)): string[] {
  if (argv[0] === "--") {
    return argv.slice(1);
  }
  return argv;
}

function findRepoRoot(startDir: string): string {
  let currentDir = startDir;
  while (true) {
    const workspaceFile = resolve(currentDir, "pnpm-workspace.yaml");
    if (existsSync(workspaceFile)) {
      return currentDir;
    }
    const parentDir = resolve(currentDir, "..");
    if (parentDir === currentDir) {
      return startDir;
    }
    currentDir = parentDir;
  }
}

function resolveRepoPath(baseDir: string, value: string): string {
  if (isAbsolute(value)) {
    return value;
  }
  return resolve(baseDir, value);
}

export function loadContracts(contractsPath: string): ContractConfig[] {
  const raw = JSON.parse(readFileSync(contractsPath, "utf-8"));
  if (!Array.isArray(raw)) {
    throw new Error("contracts.json must be an array");
  }
  const baseDir = findRepoRoot(dirname(contractsPath));
  return (raw as ContractConfig[]).map((contract) => ({
    ...contract,
    abi: resolveRepoPath(baseDir, contract.abi),
    deploy: {
      ...contract.deploy,
      broadcast_path: resolveRepoPath(baseDir, contract.deploy.broadcast_path),
    },
  }));
}

function requireProcessEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing ${key} in env file`);
  }
  return value;
}

export function requireBigInt(key: string): bigint {
  const raw = requireProcessEnv(key);
  try {
    return BigInt(raw);
  } catch {
    throw new Error(`Invalid ${key} value: ${raw}`);
  }
}

function loadDeploymentAddress(args: {
  broadcastPath: string;
  chainId: number;
  contractName: string;
}): string | null {
  const runPath = resolve(
    args.broadcastPath,
    String(args.chainId),
    "run-latest.json",
  );
  const raw = JSON.parse(readFileSync(runPath, "utf-8")) as {
    transactions?: Array<{ contractName?: string; contractAddress?: string }>;
  };
  for (const tx of raw.transactions ?? []) {
    if (tx.contractName === args.contractName && tx.contractAddress) {
      return tx.contractAddress;
    }
  }
  return null;
}

export function assertDeployArtifacts(args: {
  abiPath: string;
  chainId: number;
  deploy: { broadcast_path: string; contract_name: string };
}): string {
  const abiName = basename(args.abiPath, ".json");
  if (abiName !== args.deploy.contract_name) {
    throw new Error(
      `ABI artifact ${abiName} does not match deploy contract ${args.deploy.contract_name}`,
    );
  }

  const fromDeploy = loadDeploymentAddress({
    broadcastPath: args.deploy.broadcast_path,
    chainId: args.chainId,
    contractName: args.deploy.contract_name,
  });
  if (!fromDeploy) {
    throw new Error(
      `No deploy artifact address found for ${args.deploy.contract_name}`,
    );
  }
  return fromDeploy;
}

export function requireDeployAddress0xLower(args: {
  abiPath: string;
  chainId: number;
  deploy: { broadcast_path: string; contract_name: string };
}): string {
  const address = assertDeployArtifacts(args);
  const normalized = Address.from(address);
  return normalized.toLowerCase();
}

export function toSnakeCase(value: string): string {
  return value
    .replace(/(.)([A-Z][a-z]+)/g, "$1_$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase();
}

export function columnType(abiType: string, indexed?: boolean): PGColumnType {
  if (abiType.startsWith("uint") || abiType.startsWith("int")) {
    return "numeric";
  }
  if (abiType === "bool") {
    return "bool";
  }
  if (abiType === "string") {
    return indexed ? "bytea" : "text";
  }
  if (abiType === "address" || abiType.startsWith("bytes")) {
    return "bytea";
  }
  if (abiType.startsWith("tuple") || abiType.includes("[")) {
    throw new Error(`Unsupported ABI type for storage: ${abiType}`);
  }
  return "text";
}

export function ensureUnique(name: string, seen: Set<string>): void {
  if (!name) {
    throw new Error("Event inputs must have names");
  }
  if (seen.has(name)) {
    throw new Error(`Duplicate column name: ${name}`);
  }
  seen.add(name);
}

export function ensureLowercase(label: string, value: string): void {
  if (value !== value.toLowerCase()) {
    throw new Error(`${label} must be lowercase: ${value}`);
  }
}

export function loadAbiEvents(abiPath: string): AbiTypeEvent[] {
  const raw = JSON.parse(readFileSync(abiPath, "utf-8")) as Abi | { abi?: Abi };
  const items = Array.isArray(raw)
    ? raw
    : "abi" in raw
      ? raw.abi
      : undefined;
  if (!items || !Array.isArray(items)) {
    throw new Error(`ABI file missing .abi array: ${abiPath}`);
  }
  return items.filter((item): item is AbiTypeEvent => item.type === "event");
}

export function parseEventByName(abiPath: string, name: string): ParsedEvent {
  const abiEvents = loadAbiEvents(abiPath);
  const matchingEvents = abiEvents.filter((event) => event.name === name);
  if (matchingEvents.length === 0) {
    throw new Error(`Event ${name} not found in ABI: ${abiPath}`);
  }
  if (matchingEvents.length > 1) {
    throw new Error(`Event ${name} is overloaded in ABI: ${abiPath}`);
  }
  const parsedEvent = AbiEvent.from(matchingEvents[0]);
  return {
    name: parsedEvent.name,
    anonymous: Boolean(parsedEvent.anonymous),
    inputs: parsedEvent.inputs,
  };
}

export function validateStoreKeys(
  store: Record<string, string>,
  inputNames: Set<string>,
  eventName: string,
): void {
  for (const key of Object.keys(store)) {
    if (!inputNames.has(key)) {
      throw new Error(`Store key ${key} not found in ${eventName}`);
    }
  }
}

export function getEventAndStoreMap(args: {
  abiPath: string;
  eventName: string;
  store?: Record<string, string>;
}): {
  parsedEvent: ParsedEvent;
  storedInputs: Array<{ name: string; type: string; indexed?: boolean; column: string }>;
} {
  const parsedEvent = parseEventByName(args.abiPath, args.eventName);
  const store = args.store ?? {};
  const inputNames = new Set<string>(
    parsedEvent.inputs
      .map((input) => input.name)
      .filter((name): name is string => Boolean(name)),
  );
  validateStoreKeys(store, inputNames, args.eventName);

  const storedInputs: Array<{
    name: string;
    type: string;
    indexed?: boolean;
    column: string;
  }> = [];

  for (const input of parsedEvent.inputs) {
    if (!input.name) continue;
    const column = store[input.name];
    if (!column) continue;
    storedInputs.push({
      name: input.name,
      type: input.type,
      indexed: input.indexed,
      column,
    });
  }

  return { parsedEvent, storedInputs };
}
