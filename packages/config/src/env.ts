import { Address, Hex } from "ox";
import { z } from "zod";

function isHttpUrl(url: string): boolean {
  return url.startsWith("http");
}

const httpUrl = z.string().url().refine(isHttpUrl, "Must be http(s) URL");

function normalizeOptionalString(value: unknown): unknown {
  if (value === "") return undefined;
  return value;
}

function isHex(value: string): boolean {
  return Hex.validate(value);
}

function toHex(value: string): Hex.Hex {
  return Hex.fromString(value);
}

function isAddress(value: string): boolean {
  return Address.validate(value);
}

function toAddress(value: string): Address.Address {
  return Address.from(value);
}

const hexSchema = z.string().refine(isHex, "Expected 0x-prefixed hex string").transform(toHex);
const addressSchema = z
  .string()
  .refine(isAddress, "Expected 0x-prefixed 20-byte hex address")
  .transform(toAddress);

export const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // infra
  ANVIL_RPC_URL: httpUrl.default("http://127.0.0.1:8545"),
  CHAIN_ID: z.coerce.number().int().positive().default(31337),

  // postgres
  DATABASE_URL: z.string().min(1),

  // contracts
  IDENTITY_REGISTRY_ADDRESS: z.preprocess(normalizeOptionalString, addressSchema).optional(),
  ESCROW_ADDRESS: z.preprocess(normalizeOptionalString, addressSchema).optional(),
  REWARDS_TOKEN_ADDRESS: z.preprocess(normalizeOptionalString, addressSchema).optional(),

  // anvil keys
  ANVIL_DEPLOYER_KEY: z.preprocess(normalizeOptionalString, hexSchema).optional(),
  ANVIL_AGENT_KEY: z.preprocess(normalizeOptionalString, hexSchema).optional(),

  // shovel
  SHOVEL_PG_URL: z.string().min(1).optional(),
  SHOVEL_START_BLOCK: z.coerce.number().int().min(0).default(0)
});

export interface Env extends z.infer<typeof EnvSchema> {}

function parseEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (parsed.success) return parsed.data;

  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env: Env = parseEnv();
