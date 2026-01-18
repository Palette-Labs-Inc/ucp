import type { IdentityEventRow } from "./db.js";

export interface IndexedAgent {
  chainId: IdentityEventRow["chain_id"];
  agentId: IdentityEventRow["agent_id"];
  agentUri: string;
  owner: IdentityEventRow["owner"];
  registry: IdentityEventRow["registry"];
  domain: string | null;
  ucpProfileUrl: string | null;
  discoveryJson: unknown | null;
  fetchedAt: Date | null;
  sourceBlockNum: IdentityEventRow["block_num"];
  sourceLogIdx: IdentityEventRow["log_idx"];
  sourceTxHash: IdentityEventRow["tx_hash"];
}

export interface IndexerStore {
  upsert(agent: IndexedAgent): void;
  list(limit: number): IndexedAgent[];
  getByDomain(domain: string): IndexedAgent | undefined;
}

function normalize(domain: string): string {
  return domain.trim().toLowerCase();
}

function buildAgentKey(agent: IndexedAgent): string {
  return `${agent.chainId}:${agent.agentId}`;
}

export function createStore(): IndexerStore {
  const byDomain = new Map<string, IndexedAgent>();
  const byUpdated: IndexedAgent[] = [];
  const byAgentKey = new Map<string, string>();

  return {
    upsert(agent) {
      if (!agent.domain) return;
      const key = normalize(agent.domain);
      const agentKey = buildAgentKey(agent);
      const previousDomain = byAgentKey.get(agentKey);
      if (previousDomain && previousDomain !== key) {
        byDomain.delete(previousDomain);
      }
      const existing = byDomain.get(key);
      if (existing) {
        const index = byUpdated.findIndex(
          (item) =>
            item.chainId === existing.chainId && item.agentId === existing.agentId
        );
        if (index >= 0) {
          byUpdated.splice(index, 1);
        }
      }
      byDomain.set(key, agent);
      byAgentKey.set(agentKey, key);
      byUpdated.unshift(agent);
    },
    list(limit) {
      return byUpdated.slice(0, limit);
    },
    getByDomain(domain) {
      return byDomain.get(normalize(domain));
    }
  };
}
