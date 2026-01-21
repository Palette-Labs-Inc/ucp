import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
} from "viem";
import type { Account } from "viem/accounts";

export function createAnvilClients(args: {
  rpcUrl: string;
  chainId: number;
  account: Account;
}) {
  const chain = defineChain({
    id: args.chainId,
    name: "anvil",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
      default: { http: [args.rpcUrl] },
      public: { http: [args.rpcUrl] },
    },
  });
  const transport = http(args.rpcUrl);
  return {
    publicClient: createPublicClient({ transport, chain }),
    walletClient: createWalletClient({
      transport,
      chain,
      account: args.account,
    }),
  };
}
