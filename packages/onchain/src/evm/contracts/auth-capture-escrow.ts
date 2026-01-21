import type {
  Abi,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";
import {
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  getContract,
} from "viem";
import type {
  ContractFunctionArgs,
  ContractFunctionName,
} from "viem";

import { Address, Hex } from "ox";
import { auth_capture_escrow_abi } from "../../contracts/contracts.js";

type AuthorizeFn = ExtractAbiFunction<
  typeof auth_capture_escrow_abi,
  "authorize"
>;
type AuthorizeArgs = AbiParametersToPrimitiveTypes<AuthorizeFn["inputs"]>;
export type PaymentInfo = AuthorizeArgs[0];

export function getEscrowContract(args: {
  address: Address.Address;
  publicClient: ReturnType<typeof createPublicClient>;
  walletClient: ReturnType<typeof createWalletClient>;
}) {
  return getContract({
    address: args.address,
    abi: auth_capture_escrow_abi,
    client: { public: args.publicClient, wallet: args.walletClient },
  });
}

export function buildAuthorizeCall(args: {
  escrowAddress: Address.Address;
  paymentInfo: PaymentInfo;
  amount: AuthorizeArgs[1];
  tokenCollector: AuthorizeArgs[2];
  collectorData: AuthorizeArgs[3];
}): { to: Address.Address; data: Hex.Hex } {
  return {
    to: args.escrowAddress,
    data: encodeFunctionData({
      abi: auth_capture_escrow_abi,
      functionName: "authorize",
      args: [args.paymentInfo, args.amount, args.tokenCollector, args.collectorData],
    }),
  };
}

export function toPaymentInfo(input: {
  operator: string;
  payer: string;
  receiver: string;
  token: string;
  maxAmount: string | number | bigint;
  preApprovalExpiry: number;
  authorizationExpiry: number;
  refundExpiry: number;
  minFeeBps: number;
  maxFeeBps: number;
  feeReceiver: string;
  salt: string | number | bigint;
}): PaymentInfo {
  return {
    operator: Address.from(input.operator),
    payer: Address.from(input.payer),
    receiver: Address.from(input.receiver),
    token: Address.from(input.token),
    maxAmount: BigInt(input.maxAmount),
    preApprovalExpiry: input.preApprovalExpiry,
    authorizationExpiry: input.authorizationExpiry,
    refundExpiry: input.refundExpiry,
    minFeeBps: input.minFeeBps,
    maxFeeBps: input.maxFeeBps,
    feeReceiver: Address.from(input.feeReceiver),
    salt: BigInt(input.salt),
  };
}

export async function typedRead<
  const TAbi extends Abi,
  const TName extends ContractFunctionName<TAbi, "view" | "pure">
>(args: {
  abi: TAbi;
  address: Address.Address;
  functionName: TName;
  args?: ContractFunctionArgs<TAbi, "view" | "pure", TName>;
  publicClient: ReturnType<typeof createPublicClient>;
}) {
  return args.publicClient.readContract({
    address: args.address,
    abi: args.abi,
    functionName: args.functionName,
    args: args.args,
  });
}
