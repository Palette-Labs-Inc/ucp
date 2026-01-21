import { z } from "zod";
import { Address, Hex } from "ox";
import { mnemonicToAccount, privateKeyToAccount } from "viem/accounts";

import { auth_capture_escrow_abi } from "@ucp/contracts/generated/contracts";
import { LocalprotocolAuthCaptureInstrumentSchema } from "../../models/extensions";
import { env } from "../../env";
import { getOnchainConfig } from "../../onchain/config";
import { createAnvilClients } from "../../onchain/evm/anvil";
import { getEscrowAddress } from "../../onchain/evm/addresses";
import { toPaymentInfo } from "../../onchain/evm/contracts/auth-capture-escrow";

type LocalprotocolInstrument = z.infer<
  typeof LocalprotocolAuthCaptureInstrumentSchema
>;

export interface AuthorizationResult {
  authorizationId: Hex.Hex;
  authorizeTxHash: Hex.Hex;
}

function getOperatorAccount() {
  const mnemonic = env.ANVIL_MNEMONIC ?? env.DEV_MNEMONIC;
  if (mnemonic) return mnemonicToAccount(mnemonic, { accountIndex: 1 });
  if (!env.ESCROW_OPERATOR_PRIVATE_KEY) {
    throw new Error("Missing ESCROW_OPERATOR_PRIVATE_KEY");
  }
  Hex.assert(env.ESCROW_OPERATOR_PRIVATE_KEY);
  return privateKeyToAccount(env.ESCROW_OPERATOR_PRIVATE_KEY);
}

export async function authorizeFromInstrument(
  instrument: LocalprotocolInstrument
): Promise<AuthorizationResult> {
  const operatorAccount = getOperatorAccount();
  const onchain = getOnchainConfig(instrument.chain_id);
  const { publicClient, walletClient } = createAnvilClients({
    rpcUrl: onchain.rpcUrl,
    chainId: onchain.chainId,
    account: operatorAccount,
  });
  const escrowAddress = getEscrowAddress(onchain.chainId);
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
  const operatorAccount = getOperatorAccount();
  const onchain = getOnchainConfig(instrument.chain_id);
  const { publicClient, walletClient } = createAnvilClients({
    rpcUrl: onchain.rpcUrl,
    chainId: onchain.chainId,
    account: operatorAccount,
  });
  const escrowAddress = getEscrowAddress(onchain.chainId);
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
