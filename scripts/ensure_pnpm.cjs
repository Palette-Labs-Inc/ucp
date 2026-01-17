const userAgent = process.env.npm_config_user_agent || "";
const isPnpm = userAgent.startsWith("pnpm/");

if (!isPnpm) {
  console.error("❌ This repo requires pnpm. Install via corepack and retry:");
  console.error("   corepack enable");
  console.error("   corepack prepare pnpm@9.12.2 --activate");
  process.exit(1);
}
