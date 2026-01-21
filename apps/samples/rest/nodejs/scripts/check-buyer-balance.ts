import { Address } from "ox";
import { mnemonicToAccount } from "viem/accounts";

import { contractAddresses } from "@ucp/onchain/contracts";
import { createAnvilClients } from "@ucp/onchain";
import { env } from "../src/env.js";
import { getMockTokenBalance } from "../src/utils/token-balance.js";

const colors = {
  blue: (value: string) => `\x1b[34m${value}\x1b[0m`,
  green: (value: string) => `\x1b[32m${value}\x1b[0m`,
  red: (value: string) => `\x1b[31m${value}\x1b[0m`,
};

function logInfo(message: string, details?: Record<string, unknown>): void {
  const prefix = colors.blue("[check-buyer-balance]");
  if (details) console.log(prefix, message, details);
  else console.log(prefix, message);
}

function logSuccess(message: string, details?: Record<string, unknown>): void {
  const prefix = colors.green("[check-buyer-balance]");
  if (details) console.log(prefix, message, details);
  else console.log(prefix, message);
}

function logError(message: string, details?: Record<string, unknown>): void {
  const prefix = colors.red("[check-buyer-balance]");
  if (details) console.log(prefix, message, details);
  else console.log(prefix, message);
}

async function main(): Promise<void> {
  const buyerAccount = mnemonicToAccount(env.ANVIL_MNEMONIC, { addressIndex: 3 });
  const { publicClient } = createAnvilClients({
    rpcUrl: env.ESCROW_RPC_URL,
    chainId: env.CHAIN_ID,
    account: buyerAccount,
  });

  const chainId = await publicClient.getChainId();
  const addressBook = contractAddresses[chainId];
  const tokenAddress = Address.from(addressBook.MockERC3009Token);

  logInfo("Checking buyer balance", {
    buyer: buyerAccount.address,
    token: tokenAddress,
    chainId,
  });

  const balance = await getMockTokenBalance({
    publicClient,
    tokenAddress,
    ownerAddress: buyerAccount.address,
  });

  logSuccess("Buyer token balance", { balance: balance.toString() });
}

main().catch((error) => {
  logError("Balance check failed", { error });
  console.error(error);
  process.exit(1);
});
