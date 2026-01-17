import { IndexSupply, QueryBuilder } from "idxs";
import type { IndexerEnv } from "./env.js";

export interface ShovelIdentityEvent {
  chain_id: number;
  block_num: number;
  log_idx: number;
  tx_hash: string;
  registry: string;
  agent_id: number;
  agent_uri: string | null;
  owner: string | null;
}

export interface ShovelDatabase {
  erc8004_identity_events: ShovelIdentityEvent;
}

export function createQueryBuilder(env: IndexerEnv) {
  const client = IndexSupply.create(
    env.IDXS_URL || env.IDXS_API_KEY
      ? {
          url: env.IDXS_URL,
          apiKey: env.IDXS_API_KEY
        }
      : undefined
  );

  return QueryBuilder.from<ShovelDatabase>(client);
}
