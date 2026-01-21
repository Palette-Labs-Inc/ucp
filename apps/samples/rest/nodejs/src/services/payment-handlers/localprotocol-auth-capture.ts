import { z } from "zod";
import { Address, Hex } from "ox";
import { mnemonicToAccount } from "viem/accounts";

import { auth_capture_escrow_abi, contractAddresses } from "@ucp/onchain/contracts";
import { LocalprotocolAuthCaptureInstrumentSchema } from "../../models/extensions";
import { env } from "../../env";
import { createAnvilClients, toPaymentInfo } from "@ucp/onchain";

type LocalprotocolInstrument = z.infer<
  typeof LocalprotocolAuthCaptureInstrumentSchema
>;

// AuthCaptureEscrow terms -> UCP payment data fields:
// operator: backend signer that calls escrow (ANVIL account index 1).
// payer: end customer wallet (buyer).
// receiver: merchant wallet that receives the payment.
// tokenCollector: contract that pulls tokens from payer into escrow.
// collectorData: extra data for the tokenCollector (e.g. permit / approval).

export interface AuthorizationResult {
  authorizationId: Hex.Hex;
  authorizeTxHash: Hex.Hex;
}

function getOperatorAccount() {
  return mnemonicToAccount(env.ANVIL_MNEMONIC, { accountIndex: 1 });
}

export async function authorizeFromInstrument(
  instrument: LocalprotocolInstrument
): Promise<AuthorizationResult> {
  // "authorize" = escrow funds (hold). No fee parameters are applied here.
  const operatorAccount = getOperatorAccount();
  const { publicClient, walletClient } = createAnvilClients({
    rpcUrl: env.ESCROW_RPC_URL,
    chainId: env.CHAIN_ID,
    account: operatorAccount,
  });
  const escrowAddress = Address.from(
    contractAddresses[env.CHAIN_ID].AuthCaptureEscrow
  );
  const paymentInfo = toPaymentInfo({
    operator: instrument.operator,
    payer: instrument.payer,
    receiver: instrument.receiver,
    token: instrument.token,
    maxAmount: instrument.max_amount,
    preApprovalExpiry: instrument.pre_approval_expiry,
    authorizationExpiry: instrument.authorization_expiry,
    refundExpiry: instrument.refund_expiry,
    minFeeBps: instrument.min_fee_bps,
    maxFeeBps: instrument.max_fee_bps,
    feeReceiver: instrument.fee_receiver,
    salt: instrument.salt,
  });

  const collectorData = (() => {
    const value = instrument.collector_data;
    Hex.assert(value);
    return value;
  })();

  const { request } = await publicClient.simulateContract({
    address: escrowAddress,
    abi: auth_capture_escrow_abi,
    functionName: "authorize",
    args: [
      paymentInfo,
      BigInt(instrument.amount),
      Address.from(instrument.token_collector),
      collectorData,
    ],
    account: operatorAccount.address,
  });

  const authorizeTxHash = await walletClient.writeContract({
    ...request,
    account: operatorAccount,
  });

  await publicClient.waitForTransactionReceipt({ hash: authorizeTxHash });
  const authorizationId = await publicClient.readContract({
    address: escrowAddress,
    abi: auth_capture_escrow_abi,
    functionName: "getHash",
    args: [paymentInfo],
  });

  return {
    authorizationId: Hex.from(authorizationId),
    authorizeTxHash: Hex.from(authorizeTxHash),
  };
}

export async function captureFromInstrument(
  instrument: LocalprotocolInstrument
): Promise<void> {
  // "capture" = release escrowed funds to receiver, with optional fee.
  const operatorAccount = getOperatorAccount();
  const { publicClient, walletClient } = createAnvilClients({
    rpcUrl: env.ESCROW_RPC_URL,
    chainId: env.CHAIN_ID,
    account: operatorAccount,
  });
  const escrowAddress = Address.from(
    contractAddresses[env.CHAIN_ID].AuthCaptureEscrow
  );
  const paymentInfo = toPaymentInfo({
    operator: instrument.operator,
    payer: instrument.payer,
    receiver: instrument.receiver,
    token: instrument.token,
    maxAmount: instrument.max_amount,
    preApprovalExpiry: instrument.pre_approval_expiry,
    authorizationExpiry: instrument.authorization_expiry,
    refundExpiry: instrument.refund_expiry,
    minFeeBps: instrument.min_fee_bps,
    maxFeeBps: instrument.max_fee_bps,
    feeReceiver: instrument.fee_receiver,
    salt: instrument.salt,
  });

  const { request } = await publicClient.simulateContract({
    address: escrowAddress,
    abi: auth_capture_escrow_abi,
    functionName: "capture",
    args: [
      paymentInfo,
      BigInt(instrument.amount),
      Number(instrument.min_fee_bps),
      Address.from(instrument.fee_receiver),
    ],
    account: operatorAccount.address,
  });

  await walletClient.writeContract({
    ...request,
    account: operatorAccount,
  });
}
