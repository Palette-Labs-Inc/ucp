import { env } from "../env";

export interface OnchainConfig {
  rpcUrl: string;
  chainId: number;
}

export function getOnchainConfig(chainId?: number): OnchainConfig {
  return {
    rpcUrl: env.ESCROW_RPC_URL,
    chainId: chainId ?? env.CHAIN_ID,
  };
}
