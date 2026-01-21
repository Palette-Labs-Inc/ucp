import { resolve } from "node:path";

import { generateEnvSchemaFromTemplates } from "@ucp/config/env";
import { appRootFromCwd, repoRoot } from "@ucp/config/path";

const repoRootDir = repoRoot();
const appRoot = appRootFromCwd({ appPath: "apps/samples/rest/nodejs" });

generateEnvSchemaFromTemplates({
  templatePaths: [
    resolve(repoRootDir, ".env.template"),
    resolve(appRoot, ".env.local.example"),
  ],
  outputPath: resolve(appRoot, "src", "_generated", "env.ts"),
  schemaName: "AppEnvSchema",
  interfaceName: "AppEnv",
  headerComment: [
    "Defaults are generated from template files only.",
    "Runtime .env values are not read by this generator.",
    "Templates: .env.template, .env.local.example",
  ],
});
