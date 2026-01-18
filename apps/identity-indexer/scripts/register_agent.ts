import { AgentUriZodSchema, type AgentUriZod } from "@ucp/erc8004-specs";
import { identity_registry_abi } from "@ucp/contracts/generated/contracts";
import { contractAddresses } from "@ucp/contracts/generated/addresses";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

interface AgentConfig {
  ucpProfileUrl: string;
  agentUriPath: string;
  name: string;
  description: string;
  imageUrl: string;
}

function readEnv(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value) return value;
  if (fallback) return fallback;
  throw new Error(`Missing env var: ${name}`);
}

async function resolveRegistryAddress(): Promise<string> {
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
  return address;
}

async function getRegistryAddress(chainId: number): Promise<`0x${string}`> {
  const addressBook = contractAddresses[chainId];
  if (addressBook?.IdentityRegistry) {
    return addressBook.IdentityRegistry;
  }
  return (await resolveRegistryAddress()) as `0x${string}`;
}

function buildAgentUri(
  config: AgentConfig,
  agentRegistry: string,
  agentId: number
): AgentUriZod {
  return AgentUriZodSchema.parse({
    type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
    name: config.name,
    description: config.description,
    image: config.imageUrl,
    endpoints: [
      {
        name: "UCP",
        endpoint: config.ucpProfileUrl,
        version: "2026-01-11",
      },
    ],
    x402Support: false,
    active: true,
    registrations: [
      {
        agentId,
        agentRegistry,
      },
    ],
    supportedTrust: ["reputation", "validation"],
  });
}

async function ensureOutputDir(path: string): Promise<void> {
  const dir = dirname(path);
  await mkdir(dir, { recursive: true });
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
      if (parent === current) {
        return startDir;
      }
      current = parent;
    }
  }
}

async function main(): Promise<void> {
  const rpcUrl = readEnv("ANVIL_RPC_URL", "http://127.0.0.1:8545");
  const deployerKey = readEnv("ANVIL_DEPLOYER_KEY");
  const ucpProfileUrl = readEnv(
    "UCP_PROFILE_URL",
    "http://localhost:3000/.well-known/ucp"
  );
  const repoRoot = await findRepoRoot(process.cwd());
  const agentUriPath = readEnv(
    "AGENT_URI_PATH",
    resolve(repoRoot, "apps", "identity-indexer", "data", "agents")
  );

  const account = privateKeyToAccount(deployerKey as `0x${string}`);
  const publicClient = createPublicClient({ transport: http(rpcUrl) });
  const walletClient = createWalletClient({ account, transport: http(rpcUrl) });
  const chainId = await publicClient.getChainId();
  const registryAddress = await getRegistryAddress(chainId);
  const agentRegistry = `eip155:${chainId}:${registryAddress}`;

  const config: AgentConfig = {
    ucpProfileUrl,
    agentUriPath,
    name: "Sample Merchant Agent",
    description: "Sample merchant agent for local UCP discovery testing.",
    imageUrl: "https://example.com/agentimage.png",
  };

  const agentId = Number(
    await publicClient.readContract({
      address: registryAddress,
      abi: identity_registry_abi,
      functionName: "totalAgents",
    })
  );
  const nextAgentId = agentId + 1;
  const agentUri = buildAgentUri(config, agentRegistry, nextAgentId);
  const agentUriJson = JSON.stringify(agentUri, null, 2);
  const agentUriDataUrl = `data:application/json;base64,${Buffer.from(agentUriJson).toString("base64")}`;

  const { request } = await publicClient.simulateContract({
    address: registryAddress,
    abi: identity_registry_abi,
    functionName: "register",
    args: [agentUriDataUrl],
    account,
  });
  await walletClient.writeContract(request);

  const outputPath = resolve(
    config.agentUriPath,
    `agent-uri-${nextAgentId}.json`
  );
  await ensureOutputDir(outputPath);
  await writeFile(outputPath, agentUriJson + "\n");

  console.log(`Registered agent ${nextAgentId}`);
  console.log(`Wrote agent URI to ${outputPath}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
