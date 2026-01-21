import { Address } from "ox";
import { contractAddresses } from "@ucp/contracts/generated/addresses";

import type { RpcActions } from "../router";
import type { MerchantPrepareCheckoutParams } from "../types";
import { buildAuthorizeCall } from "../../evm/contracts/auth-capture-escrow";

export function createMerchantActions(args: {
  chainId: number;
}): Pick<
  RpcActions,
  "escrow_getAddress" | "merchant_prepareCheckout"
> {
  const escrowAddress = Address.from(
    contractAddresses[args.chainId].AuthCaptureEscrow
  );
  return {
    async escrow_getAddress() {
      return { address: escrowAddress };
    },
    async merchant_prepareCheckout(params: MerchantPrepareCheckoutParams) {
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
