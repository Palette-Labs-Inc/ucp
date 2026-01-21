import { Address } from "ox";
import { contractAddresses } from "#/contracts";

import type { RpcActions } from "../router.js";
import type { MerchantPrepareCheckoutParams } from "../types.js";
import { buildAuthorizeCall } from "../../evm/contracts/auth-capture-escrow.js";

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
    async escrow_getAddress(_params: []) {
      return { address: escrowAddress };
    },
    async merchant_prepareCheckout([params]: [MerchantPrepareCheckoutParams]) {
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
