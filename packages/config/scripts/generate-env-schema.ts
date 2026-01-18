import { resolve } from "node:path";

import { repoRoot } from "../src/path-utils/index.js";

import { generateEnvSchemaTemplate } from "./env-schema-generator.js";

function parseArgs(argv: string[] = process.argv.slice(2)): string[] {
  if (argv[0] === "--") return argv.slice(1);
  return argv;
}

function main(): void {
  const [inputPathArg, outputPathArg] = parseArgs();
  const repoRootDir = repoRoot();
  const inputPath = inputPathArg ?? resolve(repoRootDir, ".env.template");
  const outputPath =
    outputPathArg ??
    resolve(
      repoRootDir,
      "packages/config/_generated/base-env.ts",
    );

  generateEnvSchemaTemplate({ inputPath, outputPath });
}

main();
