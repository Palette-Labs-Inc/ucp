import {Address} from 'ox';
import {mnemonicToAccount} from 'viem/accounts';

import {
  auth_capture_escrow_abi,
} from '@ucp/contracts/generated/contracts';
import {contractAddresses} from '@ucp/contracts/generated/addresses';
import {env} from '../src/env.js';
import {createAnvilClients, toPaymentInfo} from '@ucp/onchain';
import {getCollectorConfig} from '../src/utils/collector-utils.js';

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

async function readJsonOrThrow<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!response.ok) {
    throw new Error(
      `Request failed (${response.status} ${response.statusText}): ${text}`,
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid JSON response: ${text}`);
  }
}

async function main(): Promise<void> {
  const sampleBaseUrl = env.SAMPLE_BASE_URL;
  const productId = env.PRODUCT_ID;
  const simulationSecret = env.SIMULATION_SECRET;

  // Actor mapping to AuthCaptureEscrow terms:
  // operator = backend signer (account index 1)
  // receiver = merchant (account index 2)
  // payer = buyer (account index 3)
  const mnemonic = env.ANVIL_MNEMONIC;
  const operatorAccount = mnemonicToAccount(mnemonic, {accountIndex: 1});
  const merchantAccount = mnemonicToAccount(mnemonic, {accountIndex: 2});
  const buyerAccount = mnemonicToAccount(mnemonic, {accountIndex: 3});

  const {publicClient} = createAnvilClients({
    rpcUrl: env.ESCROW_RPC_URL,
    chainId: env.CHAIN_ID,
    account: operatorAccount,
  });
  const {walletClient: buyerClient} = createAnvilClients({
    rpcUrl: env.ESCROW_RPC_URL,
    chainId: env.CHAIN_ID,
    account: buyerAccount,
  });

  const chainId = await publicClient.getChainId();
  const addressBook = contractAddresses[chainId];

  // Contracts:
  // AuthCaptureEscrow = escrow that tracks authorization/capture state.
  // PreApprovalPaymentCollector = tokenCollector used by authorize().
  // MockERC3009Token = test token pulled from payer into escrow.
  const escrowAddress = Address.from(addressBook.AuthCaptureEscrow);
  const tokenAddress = Address.from(addressBook.MockERC3009Token);

  const amount = BigInt(env.AMOUNT);
  const maxAmount = BigInt(env.MAX_AMOUNT);
  const preApprovalExpiry = nowSeconds() + 3600;
  const authorizationExpiry = nowSeconds() + 5400;
  const refundExpiry = nowSeconds() + 7200;
  const feeReceiver = Address.from(env.FEE_RECEIVER);
  const salt = BigInt(env.SALT);

  // PaymentInfo mirrors the escrow struct. "feeReceiver" is used only when
  // fees are applied (fee bps > 0). With 0 fees, it is informational.
  const paymentInfo = toPaymentInfo({
    operator: operatorAccount.address,
    payer: buyerAccount.address,
    receiver: merchantAccount.address,
    token: tokenAddress,
    maxAmount,
    preApprovalExpiry,
    authorizationExpiry,
    refundExpiry,
    minFeeBps: 0,
    maxFeeBps: 0,
    feeReceiver,
    salt,
  });

  const collectorConfig = getCollectorConfig({
    strategy: 'preapproval',
    chainId,
  });
  await collectorConfig.preSteps({
    publicClient,
    buyerClient,
    buyerAddress: buyerAccount.address,
    tokenAddress,
    maxAmount,
    paymentInfo,
  });

  // 3) Create checkout and submit payment_data to backend.
  const checkoutResponse = await fetch(`${sampleBaseUrl}/checkout-sessions`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      currency: 'USD',
      line_items: [{item: {id: productId}, quantity: 1}],
      payment: {},
    }),
  });
  const checkout = await readJsonOrThrow<{id: string}>(checkoutResponse);

  const completeResponse = await fetch(
    `${sampleBaseUrl}/checkout-sessions/${checkout.id}/complete`,
    {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        payment_data: {
          id: 'instr_1',
          handler_id: 'localprotocol_auth_capture',
          type: 'localprotocol_auth_capture',
          operator: operatorAccount.address,
          payer: buyerAccount.address,
          receiver: merchantAccount.address,
          token: tokenAddress,
          amount: amount.toString(),
          max_amount: maxAmount.toString(),
          pre_approval_expiry: preApprovalExpiry,
          authorization_expiry: authorizationExpiry,
          refund_expiry: refundExpiry,
          min_fee_bps: 0,
          max_fee_bps: 0,
          fee_receiver: feeReceiver,
          salt: salt.toString(),
          token_collector: collectorConfig.collectorAddress,
          collector_data: collectorConfig.collectorData,
        },
      }),
    },
  );
  const completed = await readJsonOrThrow<{
    id: string;
    order_id?: string;
  }>(completeResponse);

  // 4) Simulate shipping which triggers capture in backend.
  const shipResponse = await fetch(
    `${sampleBaseUrl}/testing/simulate-shipping/${completed.order_id}`,
    {
      method: 'POST',
      headers: {'Simulation-Secret': simulationSecret},
    },
  );
  await readJsonOrThrow(shipResponse);

  const escrowHash = await publicClient.readContract({
    address: escrowAddress,
    abi: auth_capture_escrow_abi,
    functionName: 'getHash',
    args: [paymentInfo],
  });

  console.log('checkout_id', checkout.id);
  console.log('order_id', completed.order_id);
  console.log('payment_hash', escrowHash);
  console.log('simulation_status', 'success');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
