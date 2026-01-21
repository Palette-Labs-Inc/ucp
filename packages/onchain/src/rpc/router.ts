import type { RpcSchema } from "ox";

import type { BackendRpcSchema } from "./schema";

type RpcMethodName = RpcSchema.ExtractMethodName<BackendRpcSchema>;
type RpcMethodParams<M extends RpcMethodName> = RpcSchema.ExtractParams<
  BackendRpcSchema,
  M
>;
type RpcMethodResult<M extends RpcMethodName> = RpcSchema.ExtractReturnType<
  BackendRpcSchema,
  M
>;

export interface EscrowGetAddressRequest {
  method: "escrow_getAddress";
  params: RpcMethodParams<"escrow_getAddress">;
}

export interface MerchantPrepareCheckoutRequest {
  method: "merchant_prepareCheckout";
  params: RpcMethodParams<"merchant_prepareCheckout">;
}

type RpcRequest = EscrowGetAddressRequest | MerchantPrepareCheckoutRequest;

export interface RpcActions {
  escrow_getAddress: () => Promise<RpcMethodResult<"escrow_getAddress">>;
  merchant_prepareCheckout: (
    params: RpcMethodParams<"merchant_prepareCheckout">[0]
  ) => Promise<RpcMethodResult<"merchant_prepareCheckout">>;
}

export function createRpcRouter(actions: RpcActions) {
  async function request(
    args: RpcRequest
  ): Promise<RpcMethodResult<RpcMethodName>> {
    switch (args.method) {
      case "escrow_getAddress":
        return actions.escrow_getAddress();
      case "merchant_prepareCheckout":
        return actions.merchant_prepareCheckout(args.params[0]);
    }
  }

  return { request };
}
