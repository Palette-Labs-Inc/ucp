import { AgentUriZodSchema as AgentUriSchema } from "@ucp/erc8004-specs";
import * as Hex from "ox/Hex";
import type { AppEnv } from "./env.js";
import {
  fetchIdentityEvents,
  loadCursor,
  saveCursor,
  upsertIndexedAgent,
  type IdentityEventRow,
  type IndexedAgent,
  type Json,
  type IndexerCursor,
} from "./db.js";
import type { Kysely } from "kysely";
import type { IndexerDb } from "./db.js";
import { log } from "./logger.js";

const DEFAULT_CURSOR: IndexerCursor = {
  lastBlockNum: "0",
  lastLogIdx: 0
};

const ACTIVE_DELAY_MS = 250;

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

async function resolveAgentUri(
  agentUri: string,
  timeoutMs: number
): Promise<Json> {
  const payload = await fetchJson(agentUri, timeoutMs);
  return AgentUriSchema.parse(payload) as Json;
}

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
    sourceTxHash: row.tx_hash
  };
}

async function handleRow(
  row: IdentityEventRow,
  env: AppEnv
): Promise<IndexedAgent> {
  if (!row.agent_uri) {
    return buildIndexedAgent(row, { agentUriJson: null });
  }

  try {
    const agentUriJson = await resolveAgentUri(
      row.agent_uri,
      env.INDEXER_FETCH_TIMEOUT_MS
    );
    return buildIndexedAgent(row, { agentUriJson });
  } catch {
    return buildIndexedAgent(row, { agentUriJson: null });
    }
}

async function processBatch(
  db: Kysely<IndexerDb>,
  env: AppEnv,
  cursor: IndexerCursor
): Promise<{ cursor: IndexerCursor; processed: number }> {
  const rows = await fetchIdentityEvents(db, cursor, env.INDEXER_BATCH_SIZE);
  if (rows.length === 0) return { cursor, processed: 0 };

  let nextCursor = cursor;
  for (const row of rows) {
    const indexed = await handleRow(row, env);
    await upsertIndexedAgent(db, indexed);
    const parsedAgentUri = indexed.agentUriJson
      ? AgentUriSchema.parse(indexed.agentUriJson)
      : null;
    log.info("indexer.row.processed", {
      chainId: indexed.chainId,
      agentId: indexed.agentId,
      blockNum: indexed.sourceBlockNum,
      logIdx: indexed.sourceLogIdx,
      txHash: indexed.sourceTxHash ? Hex.fromBytes(indexed.sourceTxHash) : null,
    });
    log.info("indexer.agent.uri", parsedAgentUri);
    nextCursor = { lastBlockNum: row.block_num, lastLogIdx: row.log_idx };
  }

  return { cursor: nextCursor, processed: rows.length };
}

export async function startIndexer(
  db: Kysely<IndexerDb>,
  env: AppEnv
): Promise<{ stop: () => void }> {
  let cursor = await loadCursor(db, DEFAULT_CURSOR);
  log.info("indexer.cursor.loaded", cursor);
  let isRunning = true;
  let isProcessing = false;
  let lastProcessed = 0;

  const tick = async () => {
    if (!isRunning || isProcessing) return;
    isProcessing = true;
    try {
      const result = await processBatch(db, env, cursor);
      cursor = result.cursor;
      lastProcessed = result.processed;
      if (result.processed > 0) {
        await saveCursor(db, cursor);
      }
    } finally {
      isProcessing = false;
      if (isRunning) {
        const delay =
          lastProcessed > 0 ? ACTIVE_DELAY_MS : env.INDEXER_POLL_INTERVAL_MS;
        setTimeout(tick, delay);
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
