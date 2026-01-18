import { AgentUriZodSchema as AgentUriSchema } from "@ucp/erc8004-specs";
import { UcpDiscoveryProfileSchema } from "@ucp-js/sdk";
import type { AppEnv } from "./env.js";
import {
  fetchIdentityEvents,
  type IdentityEventRow,
  type IndexerCursor,
} from "./db.js";
import type { Kysely } from "kysely";
import type { DB } from "./db.js";
import type { IndexedAgent, IndexerStore } from "./store.js";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const DEFAULT_CURSOR: IndexerCursor = {
  lastBlockNum: "0",
  lastLogIdx: 0
};

const ACTIVE_DELAY_MS = 250;
const CURSOR_FILE = "identity-indexer.cursor.json";

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

function extractUcpProfileUrl(agentUri: unknown): string {
  const parsed = AgentUriSchema.parse(agentUri);
  const endpoint = parsed.endpoints.find(
    (entry) => entry.name.toLowerCase() === "ucp"
  );
  if (!endpoint) {
    throw new Error("Missing UCP endpoint in agentURI");
  }
  return endpoint.endpoint;
}

function extractDomain(ucpProfileUrl: string): string {
  return new URL(ucpProfileUrl).hostname;
}

async function resolveAgentUri(agentUri: string, timeoutMs: number) {
  const payload = await fetchJson(agentUri, timeoutMs);
  const ucpProfileUrl = extractUcpProfileUrl(payload);
  return {
    domain: extractDomain(ucpProfileUrl),
    ucpProfileUrl
  };
}

async function resolveUcpProfile(ucpProfileUrl: string, timeoutMs: number) {
  const payload = await fetchJson(ucpProfileUrl, timeoutMs);
  return UcpDiscoveryProfileSchema.parse(payload);
}

function buildIndexedAgent(
  row: IdentityEventRow,
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
  row: IdentityEventRow,
  env: AppEnv
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
    const agentUri = await resolveAgentUri(
      row.agent_uri,
      env.INDEXER_FETCH_TIMEOUT_MS
    );
    const discoveryJson = await resolveUcpProfile(
      agentUri.ucpProfileUrl,
      env.INDEXER_FETCH_TIMEOUT_MS
    );
    return buildIndexedAgent(row, {
      domain: agentUri.domain,
      ucpProfileUrl: agentUri.ucpProfileUrl,
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

function getCursorPath(): string {
  return resolve(process.cwd(), CURSOR_FILE);
}

async function loadCursor(): Promise<IndexerCursor> {
  try {
    const payload = await readFile(getCursorPath(), "utf8");
    const parsed = JSON.parse(payload) as IndexerCursor;
    if (parsed.lastBlockNum == null || parsed.lastLogIdx == null) {
      return DEFAULT_CURSOR;
    }
    return parsed;
  } catch {
    return DEFAULT_CURSOR;
  }
}

async function saveCursor(cursor: IndexerCursor): Promise<void> {
  const payload = JSON.stringify(cursor);
  await writeFile(getCursorPath(), payload, "utf8");
}

async function processBatch(
  db: Kysely<DB>,
  env: AppEnv,
  cursor: IndexerCursor,
  store: IndexerStore
): Promise<{ cursor: IndexerCursor; processed: number }> {
  const rows = await fetchIdentityEvents(db, cursor, env.INDEXER_BATCH_SIZE);
  if (rows.length === 0) return { cursor, processed: 0 };

  let nextCursor = cursor;
  for (const row of rows) {
    const indexed = await handleRow(row, env);
    store.upsert(indexed);
    nextCursor = { lastBlockNum: row.block_num, lastLogIdx: row.log_idx };
  }

  return { cursor: nextCursor, processed: rows.length };
}

export async function startIndexer(
  db: Kysely<DB>,
  env: AppEnv,
  store: IndexerStore
): Promise<{ stop: () => void }> {
  let cursor = await loadCursor();
  let isRunning = true;
  let isProcessing = false;
  let lastProcessed = 0;

  const tick = async () => {
    if (!isRunning || isProcessing) return;
    isProcessing = true;
    try {
      const result = await processBatch(db, env, cursor, store);
      cursor = result.cursor;
      lastProcessed = result.processed;
      if (result.processed > 0) {
        await saveCursor(cursor);
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
