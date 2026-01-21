import type { RpcActions } from "../router";
import type { MerchantPrepareCheckoutParams } from "../types";
import { buildAuthorizeCall } from "../../evm/contracts/auth-capture-escrow";
import { getEscrowAddress } from "../../evm/addresses";

export function createMerchantActions(args: {
  chainId: number;
}): Pick<
  RpcActions,
  "escrow_getAddress" | "merchant_prepareCheckout"
> {
  return {
    async escrow_getAddress() {
      return { address: getEscrowAddress(args.chainId) };
    },
    async merchant_prepareCheckout(params: MerchantPrepareCheckoutParams) {
      const escrowAddress = getEscrowAddress(args.chainId);
      const call = buildAuthorizeCall({
        escrowAddress,
        paymentInfo: params.paymentInfo,
        amount: params.amount,
        tokenCollector: params.tokenCollector,
        collectorData: params.collectorData,
      });
      return { calls: [call] };
    },
  };
}
