import { Address, Hex } from "ox";

import {
  contractAddresses,
  mock_erc3009_token_abi,
  pre_approval_payment_collector_abi,
} from "@ucp/onchain/contracts";
import type { createAnvilClients } from "@ucp/onchain";
import type { PaymentInfo } from "@ucp/onchain/rpc/types";

export type CollectorStrategy = "preapproval";

export interface CollectorConfig {
  collectorAddress: Address.Address;
  collectorData: Hex.Hex;
  preSteps: (args: {
    publicClient: ReturnType<typeof createAnvilClients>["publicClient"];
    buyerClient: ReturnType<typeof createAnvilClients>["walletClient"];
    buyerAddress: Address.Address;
    tokenAddress: Address.Address;
    maxAmount: bigint;
    paymentInfo: PaymentInfo;
  }) => Promise<void>;
}

async function waitForTx(
  publicClient: ReturnType<typeof createAnvilClients>["publicClient"],
  hash: `0x${string}`
) {
  await publicClient.waitForTransactionReceipt({ hash });
}

export function getCollectorConfig(args: {
  strategy: CollectorStrategy;
  chainId: number;
}): CollectorConfig {
  const addressBook = contractAddresses[args.chainId];
  switch (args.strategy) {
    case "preapproval": {
      const collectorAddress = Address.from(addressBook.PreApprovalPaymentCollector);
      return {
        collectorAddress,
        collectorData: Hex.from("0x"),
        async preSteps(stepArgs) {
          const approveGas = await stepArgs.publicClient.estimateContractGas({
            address: stepArgs.tokenAddress,
            abi: mock_erc3009_token_abi,
            functionName: "approve",
            args: [collectorAddress, stepArgs.maxAmount],
            account: stepArgs.buyerAddress,
          });
          const approveHash = await stepArgs.buyerClient.writeContract({
            address: stepArgs.tokenAddress,
            abi: mock_erc3009_token_abi,
            functionName: "approve",
            args: [collectorAddress, stepArgs.maxAmount],
            gas: approveGas,
          });
          await waitForTx(stepArgs.publicClient, approveHash);

          const preApproveGas = await stepArgs.publicClient.estimateContractGas({
            address: collectorAddress,
            abi: pre_approval_payment_collector_abi,
            functionName: "preApprove",
            args: [stepArgs.paymentInfo],
            account: stepArgs.buyerAddress,
          });
          const preApproveHash = await stepArgs.buyerClient.writeContract({
            address: collectorAddress,
            abi: pre_approval_payment_collector_abi,
            functionName: "preApprove",
            args: [stepArgs.paymentInfo],
            gas: preApproveGas,
          });
          await waitForTx(stepArgs.publicClient, preApproveHash);
        },
      };
    }
  }
}
