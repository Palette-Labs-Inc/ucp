import { AgentUriZodSchema, type AgentUriZod } from "@ucp/erc8004-specs";
import { identity_registry_abi } from "@ucp/contracts/generated/contracts";
import { contractAddresses } from "@ucp/contracts/generated/addresses";
import { createPublicClient, createWalletClient, http } from "viem";
import * as Address from "ox/Address";
import { privateKeyToAccount } from "viem/accounts";
import { env } from "../src/env.js";
import { log } from "../src/logger.js";

const AGENT_METADATA = {
  name: "Sample Merchant Agent",
  description: "Sample merchant agent for local testing.",
  imageUrl: "https://example.com/agentimage.png",
};

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
}): AgentUriZod {
  return AgentUriZodSchema.parse({
    type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
    name: args.name,
    description: args.description,
    image: args.imageUrl,
    endpoints: [],
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
  const account = privateKeyToAccount(env.ANVIL_DEPLOYER_KEY as `0x${string}`);
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
}): Promise<Address.Address> {
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
  const { account, publicClient, walletClient } = createClients();
  const chainId = await publicClient.getChainId();

  const registryAddress = getRegistryAddress(chainId);
  const { agentUri, agentUriDataUrl } = buildAgentUriPayload({
    name: AGENT_METADATA.name,
    description: AGENT_METADATA.description,
    imageUrl: AGENT_METADATA.imageUrl,
  });

  log.info("agent.uri", agentUri);
  
  const txHash = await registerAgent({
    publicClient,
    walletClient,
    account,
    registryAddress,
    agentUriDataUrl,
  });
  console.log(`Registered agent, tx: ${txHash}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
