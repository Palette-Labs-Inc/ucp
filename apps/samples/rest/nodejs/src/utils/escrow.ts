import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
  type Address,
} from 'viem';
import {mnemonicToAccount, privateKeyToAccount, type Account} from 'viem/accounts';

import {auth_capture_escrow_abi} from '@ucp/contracts/generated/contracts';
import {contractAddresses} from '@ucp/contracts/generated/addresses';
import {env} from '../env.js';

export interface EscrowConfig {
  rpcUrl: string;
  escrowAddress: Address;
  operatorAccount: Account;
  chainId: number;
}

export interface PaymentInfoInput {
  operator: Address;
  payer: Address;
  receiver: Address;
  token: Address;
  maxAmount: bigint;
  preApprovalExpiry: number;
  authorizationExpiry: number;
  refundExpiry: number;
  minFeeBps: number;
  maxFeeBps: number;
  feeReceiver: Address;
  salt: bigint;
}

export interface EscrowClients {
  publicClient: ReturnType<typeof createPublicClient>;
  walletClient: ReturnType<typeof createWalletClient>;
  operatorAddress: Address;
}

export function createEscrowClients(config: EscrowConfig): EscrowClients {
  const chain = defineChain({
    id: config.chainId,
    name: 'anvil',
    nativeCurrency: {name: 'Ether', symbol: 'ETH', decimals: 18},
    rpcUrls: {
      default: {http: [config.rpcUrl]},
      public: {http: [config.rpcUrl]},
    },
  });
  const transport = http(config.rpcUrl);
  const publicClient = createPublicClient({transport, chain});
  const walletClient = createWalletClient({
    transport,
    account: config.operatorAccount,
    chain,
  });
  return {
    publicClient,
    walletClient,
    operatorAddress: config.operatorAccount.address,
  };
}

export function getEscrowConfigFromEnv(chainId?: number): EscrowConfig {
  const rpcUrl = env.ESCROW_RPC_URL;
  const operatorPrivateKey =
      env.ESCROW_OPERATOR_PRIVATE_KEY as `0x${string}` | undefined;
  const resolvedChainId = chainId ?? env.CHAIN_ID;
  let escrowAddress: Address | undefined;

  if (!escrowAddress && resolvedChainId) {
    escrowAddress = contractAddresses[resolvedChainId]
        ?.AuthCaptureEscrow as Address | undefined;
  }

  const mnemonic = env.ANVIL_MNEMONIC ?? env.DEV_MNEMONIC;
  const operatorAccount =
      mnemonic ?
          mnemonicToAccount(mnemonic, {accountIndex: 1}) :
          operatorPrivateKey ?
          privateKeyToAccount(operatorPrivateKey) :
          undefined;

  if (!rpcUrl || !operatorAccount || !escrowAddress || !resolvedChainId) {
    throw new Error(
        'Missing escrow config (ESCROW_RPC_URL, operator account, or address book).',
    );
  }

  return {rpcUrl, escrowAddress, operatorAccount, chainId: resolvedChainId};
}

export function buildPaymentInfo(input: PaymentInfoInput) {
  return {
    operator: input.operator,
    payer: input.payer,
    receiver: input.receiver,
    token: input.token,
    maxAmount: input.maxAmount,
    preApprovalExpiry: input.preApprovalExpiry,
    authorizationExpiry: input.authorizationExpiry,
    refundExpiry: input.refundExpiry,
    minFeeBps: input.minFeeBps,
    maxFeeBps: input.maxFeeBps,
    feeReceiver: input.feeReceiver,
    salt: input.salt,
  };
}

export function toBigInt(value: string | number | bigint): bigint {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') return BigInt(value);
  return BigInt(value);
}

export async function authorizeEscrow(args: {
  config: EscrowConfig;
  paymentInfo: ReturnType<typeof buildPaymentInfo>;
  amount: bigint;
  tokenCollector: Address;
  collectorData: `0x${string}`;
}): Promise<`0x${string}`> {
  const {publicClient, walletClient, operatorAddress} =
      createEscrowClients(args.config);
  const {request} = await publicClient.simulateContract({
    address: args.config.escrowAddress,
    abi: auth_capture_escrow_abi,
    functionName: 'authorize',
    args: [
      args.paymentInfo,
      args.amount,
      args.tokenCollector,
      args.collectorData,
    ],
    account: operatorAddress,
  });
  return await walletClient.writeContract({
    ...request,
    account: args.config.operatorAccount,
  });
}

export async function captureEscrow(args: {
  config: EscrowConfig;
  paymentInfo: ReturnType<typeof buildPaymentInfo>;
  amount: bigint;
  feeBps: number;
  feeReceiver: Address;
}): Promise<`0x${string}`> {
  const {publicClient, walletClient, operatorAddress} =
      createEscrowClients(args.config);
  const {request} = await publicClient.simulateContract({
    address: args.config.escrowAddress,
    abi: auth_capture_escrow_abi,
    functionName: 'capture',
    args: [args.paymentInfo, args.amount, args.feeBps, args.feeReceiver],
    account: operatorAddress,
  });
  return await walletClient.writeContract({
    ...request,
    account: args.config.operatorAccount,
  });
}

export async function waitForEscrowReceipt(
    config: EscrowConfig,
    hash: `0x${string}`,
): Promise<void> {
  const {publicClient} = createEscrowClients(config);
  await publicClient.waitForTransactionReceipt({hash});
}

export async function readPaymentInfoHash(args: {
  config: EscrowConfig;
  paymentInfo: ReturnType<typeof buildPaymentInfo>;
}): Promise<`0x${string}`> {
  const {publicClient} = createEscrowClients(args.config);
  return (await publicClient.readContract({
    address: args.config.escrowAddress,
    abi: auth_capture_escrow_abi,
    functionName: 'getHash',
    args: [args.paymentInfo],
  })) as `0x${string}`;
}
