import { findUp } from "./find-up.js";

export function findRepoRoot(
  options: findRepoRoot.Options,
): findRepoRoot.ReturnType {
  const { marker = "pnpm-workspace.yaml", ...rest } = options;
  return findUp({ marker, ...rest });
}

export function repoRoot(options: repoRoot.Options = {}): repoRoot.ReturnType {
  const repoRoot = findRepoRoot({ from: process.cwd(), ...options });
  if (!repoRoot) {
    throw new Error("Could not find repo root from process.cwd().");
  }
  return repoRoot;
}

export namespace findRepoRoot {
  export interface Options extends Omit<findUp.Options, "marker"> {
    marker?: string;
  }

  export type ReturnType = findUp.ReturnType;
}

export namespace repoRoot {
  export type Options = Omit<findRepoRoot.Options, "from">;
  export type ReturnType = string;
}
