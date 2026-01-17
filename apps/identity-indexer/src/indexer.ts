import { AgentUriSchema } from "./agent-uri.js";
import type { IndexerEnv } from "./env.js";
import type { ShovelIdentityEvent } from "./idx.js";
import type { QueryBuilder } from "idxs";

export interface IndexedAgent {
  chainId: number;
  agentId: number;
  agentUri: string;
  owner: string | null;
  registry: string;
  domain: string | null;
  ucpProfileUrl: string | null;
  discoveryJson: unknown | null;
  fetchedAt: Date | null;
  sourceBlockNum: number;
  sourceLogIdx: number;
  sourceTxHash: string;
}

interface IndexerCursor {
  lastBlockNum: number;
  lastLogIdx: number;
}

const DEFAULT_CURSOR: IndexerCursor = { lastBlockNum: 0, lastLogIdx: 0 };

async function fetchJson(url: string, timeoutMs: number): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function resolveAgentUri(agentUri: string, timeoutMs: number) {
  const payload = await fetchJson(agentUri, timeoutMs);
  return AgentUriSchema.parse(payload);
}

async function resolveUcpProfile(ucpProfileUrl: string, timeoutMs: number) {
  return await fetchJson(ucpProfileUrl, timeoutMs);
}

function buildIndexedAgent(
  row: ShovelIdentityEvent,
  resolved: {
    domain: string | null;
    ucpProfileUrl: string | null;
    discoveryJson: unknown | null;
    fetchedAt: Date | null;
  }
): IndexedAgent {
  return {
    chainId: row.chain_id,
    agentId: row.agent_id,
    agentUri: row.agent_uri ?? "",
    owner: row.owner,
    registry: row.registry,
    domain: resolved.domain,
    ucpProfileUrl: resolved.ucpProfileUrl,
    discoveryJson: resolved.discoveryJson,
    fetchedAt: resolved.fetchedAt,
    sourceBlockNum: row.block_num,
    sourceLogIdx: row.log_idx,
    sourceTxHash: row.tx_hash
  };
}

async function handleRow(
  row: ShovelIdentityEvent,
  env: IndexerEnv
): Promise<IndexedAgent> {
  if (!row.agent_uri) {
    return buildIndexedAgent(row, {
      domain: null,
      ucpProfileUrl: null,
      discoveryJson: null,
      fetchedAt: null
    });
  }

  try {
    const agentUri = await resolveAgentUri(row.agent_uri, env.INDEXER_FETCH_TIMEOUT_MS);
    const discoveryJson = await resolveUcpProfile(
      agentUri.business.ucpProfileUrl,
      env.INDEXER_FETCH_TIMEOUT_MS
    );
    return buildIndexedAgent(row, {
      domain: agentUri.business.domain,
      ucpProfileUrl: agentUri.business.ucpProfileUrl,
      discoveryJson,
      fetchedAt: new Date()
    });
  } catch {
    return buildIndexedAgent(row, {
      domain: null,
      ucpProfileUrl: null,
      discoveryJson: null,
      fetchedAt: null
    });
  }
}

async function fetchIdentityEvents(
  qb: QueryBuilder<any>,
  cursor: IndexerCursor,
  limit: number
): Promise<ShovelIdentityEvent[]> {
  return await qb
    .selectFrom("erc8004_identity_events")
    .select([
      "chain_id",
      "block_num",
      "log_idx",
      "tx_hash",
      "registry",
      "agent_id",
      "agent_uri",
      "owner"
    ])
    .where((eb: any) =>
      eb.or([
        eb("block_num", ">", cursor.lastBlockNum),
        eb.and([
          eb("block_num", "=", cursor.lastBlockNum),
          eb("log_idx", ">", cursor.lastLogIdx)
        ])
      ])
    )
    .orderBy("block_num", "asc")
    .orderBy("log_idx", "asc")
    .limit(limit)
    .execute();
}

async function processBatch(
  qb: QueryBuilder<any>,
  env: IndexerEnv,
  cursor: IndexerCursor,
  onIndexed: (agent: IndexedAgent) => void
): Promise<IndexerCursor> {
  const rows = await fetchIdentityEvents(qb, cursor, env.INDEXER_BATCH_SIZE);
  if (rows.length === 0) return cursor;

  let nextCursor = cursor;
  for (const row of rows) {
    const indexed = await handleRow(row, env);
    onIndexed(indexed);
    nextCursor = { lastBlockNum: row.block_num, lastLogIdx: row.log_idx };
  }

  return nextCursor;
}

export async function startIndexer(
  qb: QueryBuilder<any>,
  env: IndexerEnv,
  onIndexed: (agent: IndexedAgent) => void
): Promise<{ stop: () => void }> {
  let cursor = DEFAULT_CURSOR;
  let isRunning = true;
  let isProcessing = false;

  const tick = async () => {
    if (!isRunning || isProcessing) return;
    isProcessing = true;
    try {
      cursor = await processBatch(qb, env, cursor, onIndexed);
    } finally {
      isProcessing = false;
      if (isRunning) {
        setTimeout(tick, env.INDEXER_POLL_INTERVAL_MS);
      }
    }
  };

  tick();

  return {
    stop: () => {
      isRunning = false;
    }
  };
}
