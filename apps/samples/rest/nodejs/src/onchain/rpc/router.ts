import type { RpcSchema } from "ox";

import type { BackendRpcSchema } from "./schema";

type RpcMethod = RpcSchema.ExtractMethodName<BackendRpcSchema>;
type RpcParams<M extends RpcMethod> = RpcSchema.ExtractParams<BackendRpcSchema, M>;
type RpcResult<M extends RpcMethod> = RpcSchema.ExtractReturnType<
  BackendRpcSchema,
  M
>;

type RpcRequest =
  | {
      method: "escrow_getAddress";
      params: RpcParams<"escrow_getAddress">;
    }
  | {
      method: "merchant_prepareCheckout";
      params: RpcParams<"merchant_prepareCheckout">;
    };

export type RpcActions = {
  [M in RpcMethod]: RpcParams<M> extends []
    ? () => Promise<RpcResult<M>>
    : (params: RpcParams<M>[0]) => Promise<RpcResult<M>>;
};

export function createRpcRouter(actions: RpcActions) {
  async function request(args: RpcRequest): Promise<RpcResult<RpcMethod>> {
    switch (args.method) {
      case "escrow_getAddress":
        return actions.escrow_getAddress();
      case "merchant_prepareCheckout":
        return actions.merchant_prepareCheckout(args.params[0]);
    }
  }

  return { request };
}
