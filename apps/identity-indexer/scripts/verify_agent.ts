import { identity_registry_abi } from "@ucp/contracts/generated/contracts";
import { contractAddresses } from "@ucp/contracts/generated/addresses";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createPublicClient, http } from "viem";

function readEnv(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value) return value;
  if (fallback) return fallback;
  throw new Error(`Missing env var: ${name}`);
}

async function resolveRegistryAddress(): Promise<`0x${string}`> {
  const broadcastPath = resolve(
    process.cwd(),
    "contracts",
    "erc8004",
    "broadcast",
    "identity-registry.json"
  );
  const payload = JSON.parse(await readFile(broadcastPath, "utf-8")) as {
    deployment?: { identityRegistry?: string };
  };
  const address = payload.deployment?.identityRegistry;
  if (!address) {
    throw new Error(`Missing identity registry address in ${broadcastPath}`);
  }
  return address as `0x${string}`;
}

async function getRegistryAddress(chainId: number): Promise<`0x${string}`> {
  const addressBook = contractAddresses[chainId];
  if (addressBook?.IdentityRegistry) {
    return addressBook.IdentityRegistry;
  }
  return resolveRegistryAddress();
}

function decodeDataUri(dataUri: string): string {
  const prefix = "data:application/json;base64,";
  if (!dataUri.startsWith(prefix)) return dataUri;
  const base64 = dataUri.slice(prefix.length);
  return Buffer.from(base64, "base64").toString("utf-8");
}

async function findRepoRoot(startDir: string): Promise<string> {
  let current = startDir;
  while (true) {
    const candidate = resolve(current, "pnpm-workspace.yaml");
    try {
      await access(candidate);
      return current;
    } catch {
      const parent = resolve(current, "..");
      if (parent === current) return startDir;
      current = parent;
    }
  }
}

async function main(): Promise<void> {
  const rpcUrl = readEnv("ANVIL_RPC_URL", "http://127.0.0.1:8545");
  const agentIdArg = process.argv.find((value) => value.startsWith("--agent-id="));
  const agentId = agentIdArg ? Number(agentIdArg.split("=")[1]) : undefined;

  const publicClient = createPublicClient({ transport: http(rpcUrl) });
  const chainId = await publicClient.getChainId();
  const registryAddress = await getRegistryAddress(chainId);

  const totalAgents = Number(
    await publicClient.readContract({
      address: registryAddress,
      abi: identity_registry_abi,
      functionName: "totalAgents",
    })
  );
  const targetAgentId = agentId ?? totalAgents;
  if (!Number.isFinite(targetAgentId) || targetAgentId <= 0) {
    throw new Error("No agent found to verify");
  }

  const tokenUri = await publicClient.readContract({
    address: registryAddress,
    abi: identity_registry_abi,
    functionName: "tokenURI",
    args: [BigInt(targetAgentId)],
  });
  const decoded = decodeDataUri(tokenUri);

  const repoRoot = await findRepoRoot(process.cwd());
  const outputPath = resolve(
    repoRoot,
    "apps",
    "samples",
    "shared",
    `agent-uri-${targetAgentId}.json`
  );
  await readFile(outputPath, "utf-8").catch(() => undefined);

  console.log(`Registry: ${registryAddress}`);
  console.log(`Total agents: ${totalAgents}`);
  console.log(`Agent ID: ${targetAgentId}`);
  console.log(`tokenURI: ${tokenUri}`);
  console.log(`Decoded: ${decoded}`);
  console.log(`Local path (if saved): ${outputPath}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
