import { createDb, ensureSchema } from "./db.js";
import { env } from "./env.js";
import { startIndexer } from "./indexer.js";

async function main(): Promise<void> {
  const db = createDb(env);
  await ensureSchema(db);

  const { stop } = await startIndexer(db, env);

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
