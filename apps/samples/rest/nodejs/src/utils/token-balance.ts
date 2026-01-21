import { Address } from "ox";

import { mock_erc3009_token_abi } from "@ucp/onchain/contracts";
import type { createAnvilClients } from "@ucp/onchain";

type PublicClient = ReturnType<typeof createAnvilClients>["publicClient"];

export interface TokenBalanceArgs {
  publicClient: PublicClient;
  tokenAddress: Address.Address;
  ownerAddress: Address.Address;
}

export async function getMockTokenBalance(
  args: TokenBalanceArgs
): Promise<bigint> {
  return await args.publicClient.readContract({
    address: args.tokenAddress,
    abi: mock_erc3009_token_abi,
    functionName: "balanceOf",
    args: [args.ownerAddress],
  });
}
