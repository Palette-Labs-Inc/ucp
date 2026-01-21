import type { RpcSchema } from "ox";
import * as AbiError from "ox/AbiError";
import { Hex } from "ox";
import type { Abi } from "viem";

import type { BackendRpcSchema } from "./schema.js";

type RpcMethodName = RpcSchema.ExtractMethodName<BackendRpcSchema>;
type RpcMethodParams<M extends RpcMethodName> = RpcSchema.ExtractParams<
  BackendRpcSchema,
  M
>;
type RpcMethodResult<M extends RpcMethodName> = RpcSchema.ExtractReturnType<
  BackendRpcSchema,
  M
>;

type RpcRequestMap = {
  [M in RpcMethodName]: {
    method: M;
    params: RpcMethodParams<M>;
  };
};

type RpcRequestBase = {
  method: RpcMethodName;
  params: RpcMethodParams<RpcMethodName>;
};

export type RpcActions = {
  [M in RpcMethodName]: (
    params: RpcMethodParams<M>
  ) => Promise<RpcMethodResult<M>>;
};

export interface RpcRouterOptions {
  onError?: (error: RpcRouterError, args: RpcRequestBase) => never | Promise<never>;
}

function createUnsupportedMethodError(method: string): Error {
  return new Error(`Unsupported RPC method: ${method}`);
}

function isAbiArray(value: unknown): value is Abi {
  return Array.isArray(value);
}

function getDecodedRevertReason(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;

  const hasData = "data" in error ? error.data : undefined;
  const hasAbi = "abi" in error ? error.abi : undefined;
  if (Hex.validate(hasData) && isAbiArray(hasAbi)) {
    try {
      const abiError = AbiError.fromAbi(hasAbi, hasData);
      const decoded = AbiError.decode(abiError, hasData);
      if (Array.isArray(decoded) && decoded.length) {
        const args = decoded.map((arg) => JSON.stringify(arg)).join(", ");
        return `${abiError.name}(${args})`;
      }
      return abiError.name;
    } catch {
      return undefined;
    }
  }

  if ("cause" in error) {
    return getDecodedRevertReason(error.cause);
  }

  return undefined;
}

function getErrorSummary(error: unknown): string | undefined {
  const decoded = getDecodedRevertReason(error);
  if (decoded) return decoded;
  if (typeof error === "string") return error;
  if (!error || typeof error !== "object") return undefined;
  if ("shortMessage" in error && typeof error.shortMessage === "string") {
    return error.shortMessage;
  }
  if ("metaMessages" in error && Array.isArray(error.metaMessages)) {
    const messages = error.metaMessages.filter(
      (message) => typeof message === "string"
    );
    if (messages.length) return messages.join(" ");
  }
  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }
  return undefined;
}

export class RpcRouterError extends Error {
  override readonly name = "RpcRouterError";
  readonly method: RpcMethodName;
  readonly summary?: string;

  constructor(args: { method: RpcMethodName; cause: unknown }) {
    const summary = getErrorSummary(args.cause);
    const suffix = summary ? `: ${summary}` : "";
    super(`RPC request failed: ${args.method}${suffix}`, { cause: args.cause });
    this.method = args.method;
    this.summary = summary;
  }
}

function createRpcRouterError(
  method: RpcMethodName,
  error: unknown
): RpcRouterError {
  return new RpcRouterError({ method, cause: error });
}

export function createRpcRouter(
  actions: RpcActions,
  options: RpcRouterOptions = {}
) {
  async function request<M extends RpcMethodName>(
    args: { method: M; params: RpcMethodParams<M> }
  ): Promise<RpcMethodResult<M>> {
    try {
      const handler = actions[args.method];
      if (!handler) throw createUnsupportedMethodError(args.method);
      return await handler(args.params);
    } catch (error) {
      const wrappedError = createRpcRouterError(args.method, error);
      if (options.onError) {
        return await options.onError(wrappedError, args);
      }
      throw wrappedError;
    }
  }

  return { request };
}
