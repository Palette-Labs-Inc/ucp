import { Hono, type Context } from "hono";
import type { IndexerStore } from "./store.js";

function parseLimit(value: string | undefined): number {
  const parsed = Number(value ?? "50");
  if (!Number.isFinite(parsed)) return 50;
  return Math.min(Math.max(parsed, 1), 200);
}

export function createApp(store: IndexerStore) {
  const app = new Hono();

  app.get("/health", (c: Context) =>
    c.json({
      status: "ok"
    })
  );

  app.get("/businesses", async (c: Context) => {
    const limit = parseLimit(c.req.query("limit"));
    return c.json({
      businesses: store.list(limit)
    });
  });

  app.get("/businesses/:domain", async (c: Context) => {
    const domain = c.req.param("domain");
    const record = store.getByDomain(domain);
    if (!record) {
      return c.json({ error: "Not found" }, 404);
    }

    return c.json(record);
  });

  return app;
}
