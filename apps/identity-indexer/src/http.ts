import { Hono, type Context } from "hono";
import type { IndexerStore } from "./store.js";

export function createApp(store: IndexerStore) {
  const app = new Hono();

  app.get("/health", (c: Context) =>
    c.json({
      status: "ok"
    })
  );

  app.get("/businesses", async (c: Context) => {
    const limit = Math.min(Number(c.req.query("limit") ?? "50"), 200);
    return c.json({
      businesses: store.list(Number.isFinite(limit) ? limit : 50)
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
