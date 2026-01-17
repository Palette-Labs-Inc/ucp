import { serve } from "@hono/node-server";
import { env } from "./env.js";
import { createApp } from "./http.js";
import { createQueryBuilder } from "./idx.js";
import { startIndexer } from "./indexer.js";
import { createStore } from "./store.js";

async function main(): Promise<void> {
  const store = createStore();
  const qb = createQueryBuilder(env);
  const { stop } = await startIndexer(qb, env, (agent) => store.upsert(agent));

  const app = createApp(store);
  serve({ fetch: app.fetch, port: env.INDEXER_PORT });

  const shutdown = async () => {
    stop();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
