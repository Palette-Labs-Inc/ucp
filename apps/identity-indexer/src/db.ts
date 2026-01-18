import { Kysely, PostgresDialect, type Selectable } from "kysely";
import { Pool } from "pg";
import type { AppEnv } from "./env.js";
import type { DB } from "./db.generated.js";

type IdentityEventTable = Selectable<DB["erc8004_identity_events"]>;

export type IdentityEventRow = Pick<
  IdentityEventTable,
  | "chain_id"
  | "block_num"
  | "log_idx"
  | "tx_hash"
  | "registry"
  | "agent_id"
  | "agent_uri"
  | "owner"
>;
export type { DB };

export interface IndexerCursor {
  lastBlockNum: IdentityEventRow["block_num"];
  lastLogIdx: IdentityEventRow["log_idx"];
}

export function createDb(env: AppEnv): Kysely<DB> {
  return new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString: env.DATABASE_URL })
    })
  });
}

export async function ensureSchema(db: Kysely<DB>): Promise<void> {
  await db.schema
    .createIndex("erc8004_identity_events_block_log_idx")
    .ifNotExists()
    .on("erc8004_identity_events")
    .columns(["block_num", "log_idx"])
    .execute();
}

export async function fetchIdentityEvents(
  db: Kysely<DB>,
  cursor: IndexerCursor,
  limit: number
): Promise<IdentityEventRow[]> {
  return await db
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
