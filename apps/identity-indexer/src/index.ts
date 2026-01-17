import { serve } from "@hono/node-server";
import { createDb, ensureSchema } from "./db.js";
import { env } from "./env.js";
import { createApp } from "./http.js";
import { startIndexer } from "./indexer.js";
import { createStore } from "./store.js";

async function main(): Promise<void> {
  const db = createDb(env);
  await ensureSchema(db);
  const store = createStore();

  const { stop } = await startIndexer(db, env, store);

  const app = createApp(store);
  serve({ fetch: app.fetch, port: env.INDEXER_PORT });

  const shutdown = async () => {
    stop();
    await db.destroy();
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
