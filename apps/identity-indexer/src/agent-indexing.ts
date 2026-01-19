import type { AppEnv } from "./env.js";
import type { IdentityEventRow, IndexedAgent, Json } from "./db.js";
import type { AgentUriZod } from "@ucp/erc8004-specs";
import { resolveAgentUri } from "./agent-uri.js";
import { log } from "./logger.js";

function buildIndexedAgent(
  row: IdentityEventRow,
  resolved: {
    agentUriJson: Json | null;
  }
): IndexedAgent {
  return {
    chainId: row.chain_id,
    agentId: row.agent_id,
    agentUri: row.agent_uri ?? "",
    agentUriJson: resolved.agentUriJson,
    owner: row.owner,
    registry: row.registry,
    sourceBlockNum: row.block_num,
    sourceLogIdx: row.log_idx,
    sourceTxHash: row.tx_hash,
  };
}

export interface RowResult {
  indexed: IndexedAgent;
  parsedAgentUri: AgentUriZod | null;
}

export async function handleRow(
  row: IdentityEventRow,
  env: AppEnv
): Promise<RowResult> {
  if (!row.agent_uri) {
    return {
      indexed: buildIndexedAgent(row, { agentUriJson: null }),
      parsedAgentUri: null,
    };
  }

  try {
    const parsedAgentUri = await resolveAgentUri(
      row.agent_uri,
      env.INDEXER_FETCH_TIMEOUT_MS
    );
    return {
      indexed: buildIndexedAgent(row, { agentUriJson: parsedAgentUri }),
      parsedAgentUri,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.warn("indexer.agent.uri.invalid", {
      agentId: row.agent_id,
      chainId: row.chain_id,
      error: message,
    });
    return {
      indexed: buildIndexedAgent(row, { agentUriJson: null }),
      parsedAgentUri: null,
    };
  }
}
