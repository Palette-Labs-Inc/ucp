import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { appRootFromCwd, repoRoot } from "@ucp/config/path";
import { shovelIntegrations } from "./shovel-integrations.js";
import { writeShovelConfig } from "./shovel-config.js";
import { env as shovelEnv } from "./env.js";

function buildComposeArgs(repoRootDir: string, appRoot: string): string[] {
  const rootEnvFile = resolve(repoRootDir, ".env");
  const appEnvFile = resolve(appRoot, ".env.local");
  const composeFiles = [
    resolve(repoRootDir, "infra/docker-compose.yml"),
    resolve(appRoot, "shovel/docker-compose.yml"),
  ];

  if (!existsSync(rootEnvFile)) {
    throw new Error("Missing .env. Run: make env-init");
  }

  const envFiles = [rootEnvFile];
  if (existsSync(appEnvFile)) {
    envFiles.push(appEnvFile);
  } else {
    console.warn(
      `Missing ${appEnvFile}. Create it from .env.local.example to supply POSTGRES_* and SHOVEL_* variables.`,
    );
  }

  return [
    "compose",
    "--project-directory",
    repoRootDir,
    ...envFiles.flatMap((file) => ["--env-file", file]),
    ...composeFiles.flatMap((file) => ["-f", file]),
  ];
}

function runCompose(args: string[]): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const childProcess = spawn("docker", args, { stdio: "inherit" });
    childProcess.on("error", reject);
    childProcess.on("exit", (code) => {
      if (code === 0) return resolvePromise();
      reject(new Error(`docker ${args.join(" ")} exited with ${code}`));
    });
  });
}

export async function startShovel(): Promise<() => Promise<void>> {
  if (shovelIntegrations.length === 0) {
    throw new Error("No shovel integrations configured.");
  }

  const repoRootDir = repoRoot();
  const appRoot = appRootFromCwd({ appPath: "apps/identity-indexer" });
  const outputFile = resolve(
    appRoot,
    "shovel/generated/ucp.local.json",
  );

  mkdirSync(dirname(outputFile), { recursive: true });
  writeShovelConfig(shovelEnv, outputFile);

  const baseArgs = buildComposeArgs(repoRootDir, appRoot);
  await runCompose([...baseArgs, "up", "-d", "shovel"]);

  return async () => {
    await runCompose([...baseArgs, "stop", "shovel"]);
  };
}
