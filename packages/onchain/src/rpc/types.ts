import type { AbiParametersToPrimitiveTypes, ExtractAbiFunction } from "abitype";
import type { Address, Hex } from "ox";
import { auth_capture_escrow_abi } from "@ucp/contracts/generated/contracts";

type AuthorizeFn = ExtractAbiFunction<
  typeof auth_capture_escrow_abi,
  "authorize"
>;
type AuthorizeArgs = AbiParametersToPrimitiveTypes<AuthorizeFn["inputs"]>;

export type PaymentInfo = AuthorizeArgs[0];

export type RpcCall = {
  to: Address.Address;
  data: Hex.Hex;
  value?: Hex.Hex;
};

export interface MerchantPrepareCheckoutParams {
  paymentInfo: PaymentInfo;
  amount: AuthorizeArgs[1];
  tokenCollector: AuthorizeArgs[2];
  collectorData: AuthorizeArgs[3];
}
