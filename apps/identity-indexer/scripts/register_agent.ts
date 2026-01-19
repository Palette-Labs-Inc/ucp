import { AgentUriZodSchema, type AgentUriZod } from "@ucp/erc8004-specs";
import { identity_registry_abi } from "@ucp/contracts/generated/contracts";
import { contractAddresses } from "@ucp/contracts/generated/addresses";
import { createPublicClient, createWalletClient, http } from "viem";
import * as Address from "ox/Address";
import * as Hex from "ox/Hex";
import { privateKeyToAccount } from "viem/accounts";
import { env } from "../src/env.js";
import { log } from "../src/logger.js";

const DEFAULT_UCP_ENDPOINT = "http://localhost:3000/.well-known/ucp";

const AGENT_METADATA = {
  name: "Sample Merchant Agent",
  description: "Sample merchant agent for local testing.",
  imageUrl: "https://example.com/agentimage.png",
};

interface CliArgs {
  agentName?: string;
  agentDescription?: string;
  agentImageUrl?: string;
  ucpEndpoint?: string;
  agentUriUrl?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key?.startsWith("--")) continue;
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) continue;
    const normalizedKey = key.slice(2);
    if (normalizedKey === "agent-name") args.agentName = value;
    if (normalizedKey === "agent-description") args.agentDescription = value;
    if (normalizedKey === "agent-image-url") args.agentImageUrl = value;
    if (normalizedKey === "ucp-endpoint") args.ucpEndpoint = value;
    if (normalizedKey === "agent-uri-url") args.agentUriUrl = value;
    i += 1;
  }
  return args;
}

function resolveString(
  argValue: string | undefined,
  envKey: string,
  fallback: string
): string {
  if (argValue) return argValue;
  if (process.env[envKey]) return process.env[envKey] ?? fallback;
  return fallback;
}

function resolveOptionalString(
  argValue: string | undefined,
  envKey: string
): string | undefined {
  if (argValue) return argValue;
  if (process.env[envKey]) return process.env[envKey];
  return undefined;
}

function getRegistryAddress(chainId: number): Address.Address {
  const addressBook = contractAddresses[chainId];
  if (!addressBook?.IdentityRegistry) {
    throw new Error(`Missing IdentityRegistry address for chain ${chainId}`);
  }
  return Address.from(addressBook.IdentityRegistry);
}

function buildAgentUri(args: {
  name: string;
  description: string;
  imageUrl: string;
  endpoints: AgentUriZod["endpoints"];
}): AgentUriZod {
  return AgentUriZodSchema.parse({
    type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
    name: args.name,
    description: args.description,
    image: args.imageUrl,
    endpoints: args.endpoints,
    active: true,
    registrations: [],
  });
}

function toDataUrl(payload: string): string {
  return `data:application/json;base64,${Buffer.from(payload).toString("base64")}`;
}

function serializeAgentUri(agentUri: AgentUriZod): string {
  return JSON.stringify(agentUri, null, 2);
}

function buildAgentUriPayload(args: {
  name: string;
  description: string;
  imageUrl: string;
  endpoints: AgentUriZod["endpoints"];
}): { agentUri: AgentUriZod; agentUriJson: string; agentUriDataUrl: string } {
  const agentUri = buildAgentUri(args);
  const agentUriJson = serializeAgentUri(agentUri);
  return {
    agentUri,
    agentUriJson,
    agentUriDataUrl: toDataUrl(agentUriJson),
  };
}

function createClients() {
  const rpcUrl = `http://${env.ANVIL_HOST}:${env.ANVIL_PORT}`;
  Hex.assert(env.ANVIL_DEPLOYER_KEY, { strict: true });
  const deployerKey = env.ANVIL_DEPLOYER_KEY;
  const account = privateKeyToAccount(deployerKey);
  const publicClient = createPublicClient({ transport: http(rpcUrl) });
  const walletClient = createWalletClient({ account, transport: http(rpcUrl) });
  return { account, publicClient, walletClient };
}

async function registerAgent(args: {
  publicClient: ReturnType<typeof createPublicClient>;
  walletClient: ReturnType<typeof createWalletClient>;
  account: ReturnType<typeof privateKeyToAccount>;
  registryAddress: Address.Address;
  agentUriDataUrl: string;
}): Promise<Hex.Hex> {
  const { request } = await args.publicClient.simulateContract({
    address: args.registryAddress,
    abi: identity_registry_abi,
    functionName: "register",
    args: [args.agentUriDataUrl],
    account: args.account,
  });
  return await args.walletClient.writeContract(request);
}

async function main(): Promise<void> {
  const cliArgs = parseArgs(process.argv.slice(2));
  const { account, publicClient, walletClient } = createClients();
  const chainId = await publicClient.getChainId();

  const registryAddress = getRegistryAddress(chainId);
  const agentName = resolveString(
    cliArgs.agentName,
    "AGENT_NAME",
    AGENT_METADATA.name
  );
  const agentDescription = resolveString(
    cliArgs.agentDescription,
    "AGENT_DESCRIPTION",
    AGENT_METADATA.description
  );
  const agentImageUrl = resolveString(
    cliArgs.agentImageUrl,
    "AGENT_IMAGE_URL",
    AGENT_METADATA.imageUrl
  );
  const ucpEndpoint = resolveString(
    cliArgs.ucpEndpoint,
    "UCP_ENDPOINT",
    DEFAULT_UCP_ENDPOINT
  );
  const agentUriUrl = resolveOptionalString(
    cliArgs.agentUriUrl,
    "AGENT_URI_URL"
  );
  const { agentUri, agentUriDataUrl } = buildAgentUriPayload({
    name: agentName,
    description: agentDescription,
    imageUrl: agentImageUrl,
    endpoints: [
      {
        name: "UCP",
        endpoint: ucpEndpoint,
      },
    ],
  });
  const agentUriRef = agentUriUrl ?? agentUriDataUrl;

  log.info("agent.uri", agentUri);
  log.info("agent.uri.ref", agentUriRef);
  
  const txHash = await registerAgent({
    publicClient,
    walletClient,
    account,
    registryAddress,
    agentUriDataUrl: agentUriRef,
  });
  console.log(`Registered agent, tx: ${txHash}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
