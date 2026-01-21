import type { Address, RpcSchema } from "ox";
import type { MerchantPrepareCheckoutParams, RpcCall } from "./types";

export type BackendRpcSchema = RpcSchema.From<
  | {
      Request: {
        method: "escrow_getAddress";
        params: [];
      };
      ReturnType: { address: Address.Address };
    }
  | {
      Request: {
        method: "merchant_prepareCheckout";
        params: [MerchantPrepareCheckoutParams];
      };
      ReturnType: { calls: RpcCall[] };
    }
>;
