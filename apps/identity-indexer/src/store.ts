import type { IndexedAgent } from "./indexer.js";

export interface IndexerStore {
  upsert(agent: IndexedAgent): void;
  list(limit: number): IndexedAgent[];
  getByDomain(domain: string): IndexedAgent | undefined;
}

export function createStore(): IndexerStore {
  const byDomain = new Map<string, IndexedAgent>();
  const byUpdated: IndexedAgent[] = [];

  function normalize(domain: string): string {
    return domain.trim().toLowerCase();
  }

  return {
    upsert(agent) {
      if (!agent.domain) return;
      const key = normalize(agent.domain);
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
