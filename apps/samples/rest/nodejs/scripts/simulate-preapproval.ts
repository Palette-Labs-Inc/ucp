import {Address, Hex} from 'ox';
import {createPublicClient, createWalletClient, http} from 'viem';
import {mnemonicToAccount} from 'viem/accounts';

import {
  auth_capture_escrow_abi,
  mock_erc3009_token_abi,
  pre_approval_payment_collector_abi,
} from '@ucp/contracts/generated/contracts';
import {contractAddresses} from '@ucp/contracts/generated/addresses';
import {env} from '../src/env.js';
import {getOnchainConfig, getEscrowAddress, toPaymentInfo} from '../src/onchain';

const defaultRpcUrl = 'http://127.0.0.1:8545';
const defaultMerchantAddress = '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc';

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

function getEnvAddress(value: string | undefined, fallback: string): Address.Address {
  return Address.from(value ?? fallback);
}

async function main(): Promise<void> {
  const onchain = getOnchainConfig();
  const rpcUrl = onchain.rpcUrl ?? defaultRpcUrl;
  const sampleBaseUrl = env.SAMPLE_BASE_URL ?? 'http://localhost:3000';
  const productId = env.PRODUCT_ID ?? 'bouquet_roses';
  const simulationSecret = env.SIMULATION_SECRET ?? 'super-secret-sim-key';

  const mnemonic = env.ANVIL_MNEMONIC ?? env.DEV_MNEMONIC;
  const funder = mnemonicToAccount(mnemonic, {accountIndex: 0});
  const buyerPlatform = mnemonicToAccount(mnemonic, {accountIndex: 1});
  const merchant = mnemonicToAccount(mnemonic, {accountIndex: 2});
  const buyer = mnemonicToAccount(mnemonic, {accountIndex: 3});

  const operatorAccount = buyerPlatform;
  const buyerAccount = buyer;
  const merchantAddress = getEnvAddress(merchant.address, defaultMerchantAddress);

  const transport = http(rpcUrl);
  const publicClient = createPublicClient({transport});
  const funderClient = createWalletClient({
    transport,
    account: funder,
  });
  const operatorClient = createWalletClient({
    transport,
    account: operatorAccount,
  });
  const buyerClient = createWalletClient({
    transport,
    account: buyerAccount,
  });

  const funderBalance = await publicClient.getBalance({
    address: funder.address,
  });
  const operatorBalance = await publicClient.getBalance({
    address: operatorAccount.address,
  });
  const buyerBalance = await publicClient.getBalance({
    address: buyerAccount.address,
  });
  const minBuyerBalance = BigInt(env.MIN_BUYER_ETH ?? '10000000000000000'); // 0.01 ETH
  const minOperatorBalance = minBuyerBalance;
  let updatedBuyerBalance = buyerBalance;
  let updatedOperatorBalance = operatorBalance;
  if (operatorBalance < minOperatorBalance) {
    const topUpAmount = minOperatorBalance - operatorBalance;
    const topUpHash = await funderClient.sendTransaction({
      to: operatorAccount.address,
      value: topUpAmount,
      chain: undefined,
    });
    await publicClient.waitForTransactionReceipt({hash: topUpHash});
    updatedOperatorBalance = await publicClient.getBalance({
      address: operatorAccount.address,
    });
  }
  if (buyerBalance < minBuyerBalance) {
    const topUpAmount = minBuyerBalance - buyerBalance;
    const topUpHash = await funderClient.sendTransaction({
      to: buyerAccount.address,
      value: topUpAmount,
      chain: undefined,
    });
    await publicClient.waitForTransactionReceipt({hash: topUpHash});
    updatedBuyerBalance = await publicClient.getBalance({
      address: buyerAccount.address,
    });
  }

  console.log('funder', funder.address, 'balance', funderBalance.toString());
  console.log(
    'operator',
    operatorAccount.address,
    'balance',
    updatedOperatorBalance.toString(),
  );
  console.log('buyer', buyerAccount.address, 'balance', updatedBuyerBalance.toString());

  const chainId = await publicClient.getChainId();
  const addressBook = contractAddresses[chainId];
  if (!addressBook) {
    throw new Error(`Missing contract addresses for chain ${chainId}`);
  }

  const escrowAddress = getEscrowAddress(chainId);
  const collectorAddress = Address.from(addressBook.PreApprovalPaymentCollector);
  const tokenAddress = Address.from(addressBook.MockERC3009Token);

  if (!escrowAddress || !collectorAddress || !tokenAddress) {
    throw new Error('Missing escrow/collector/token addresses for this chain.');
  }

  const amount = BigInt(env.AMOUNT ?? 1000000);
  const maxAmount = BigInt(env.MAX_AMOUNT ?? Number(amount));
  const preApprovalExpiry = nowSeconds() + 3600;
  const authorizationExpiry = nowSeconds() + 5400;
  const refundExpiry = nowSeconds() + 7200;
  const feeReceiver = Address.from(
    env.FEE_RECEIVER ??
      '0x0000000000000000000000000000000000000000',
  );
  const salt = BigInt(env.SALT ?? 1);

  const paymentInfo = toPaymentInfo({
    operator: operatorAccount.address,
    payer: buyerAccount.address,
    receiver: merchantAddress,
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

  const tokenBalance = await publicClient.readContract({
    address: tokenAddress,
    abi: mock_erc3009_token_abi,
    functionName: 'balanceOf',
    args: [buyerAccount.address],
  });
  if (tokenBalance < maxAmount) {
    const mintAmount = maxAmount - tokenBalance;
    const mintHash = await funderClient.writeContract({
      address: tokenAddress,
      abi: mock_erc3009_token_abi,
      functionName: 'mint',
      args: [buyerAccount.address, mintAmount],
      chain: undefined,
    });
    await publicClient.waitForTransactionReceipt({hash: mintHash});
  }

  const approveGas = await publicClient.estimateContractGas({
    address: tokenAddress,
    abi: mock_erc3009_token_abi,
    functionName: 'approve',
    args: [collectorAddress, maxAmount],
    account: buyerAccount.address,
  });
  const approveHash = await buyerClient.writeContract({
    address: tokenAddress,
    abi: mock_erc3009_token_abi,
    functionName: 'approve',
    args: [collectorAddress, maxAmount],
    gas: approveGas,
    chain: undefined,
  });
  await publicClient.waitForTransactionReceipt({hash: approveHash});

  const preApproveGas = await publicClient.estimateContractGas({
    address: collectorAddress,
    abi: pre_approval_payment_collector_abi,
    functionName: 'preApprove',
    args: [paymentInfo],
    account: buyerAccount.address,
  });
  const preApproveHash = await buyerClient.writeContract({
    address: collectorAddress,
    abi: pre_approval_payment_collector_abi,
    functionName: 'preApprove',
    args: [paymentInfo],
    gas: preApproveGas,
    chain: undefined,
  });
  await publicClient.waitForTransactionReceipt({hash: preApproveHash});

  const checkoutResponse = await fetch(`${sampleBaseUrl}/checkout-sessions`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      currency: 'USD',
      line_items: [{item: {id: productId}, quantity: 1}],
      payment: {},
    }),
  });
  if (!checkoutResponse.ok) {
    throw new Error(
      `Checkout create failed: ${checkoutResponse.status} ${await checkoutResponse.text()}`,
    );
  }
  const checkout = (await checkoutResponse.json()) as {id: string};

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
          receiver: merchantAddress,
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
          token_collector: collectorAddress,
          collector_data: Hex.from('0x'),
          authorization_id: '0x',
          authorize_tx_hash: '0x',
          chain_id: chainId,
          escrow_contract: escrowAddress,
        },
      }),
    },
  );
  if (!completeResponse.ok) {
    throw new Error(
      `Checkout complete failed: ${completeResponse.status} ${await completeResponse.text()}`,
    );
  }
  const completed = (await completeResponse.json()) as {
    id: string;
    order_id?: string;
  };

  if (!completed.order_id) {
    throw new Error('Checkout completed without an order_id.');
  }

  const shipResponse = await fetch(
    `${sampleBaseUrl}/testing/simulate-shipping/${completed.order_id}`,
    {
      method: 'POST',
      headers: {'Simulation-Secret': simulationSecret},
    },
  );
  if (!shipResponse.ok) {
    throw new Error(
      `Ship failed: ${shipResponse.status} ${await shipResponse.text()}`,
    );
  }

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
