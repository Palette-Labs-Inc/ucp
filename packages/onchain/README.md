# @ucp/onchain

Shared onchain helpers used by samples and services.

## What it provides

- EVM helpers (client creation, contract call building, typed reads)
- RPC helpers (typed router, schema, request/response types)

## Usage (Node)

```ts
import { createAnvilClients, toPaymentInfo } from "@ucp/onchain";

const { publicClient } = createAnvilClients({
  rpcUrl: process.env.ESCROW_RPC_URL!,
  chainId: Number(process.env.CHAIN_ID),
  account,
});

const paymentInfo = toPaymentInfo({
  operator,
  payer,
  receiver,
  token,
  maxAmount,
  preApprovalExpiry,
  authorizationExpiry,
  refundExpiry,
  minFeeBps: 0,
  maxFeeBps: 0,
  feeReceiver,
  salt,
});
```

```ts
import { createRpcRouter } from "@ucp/onchain";
import { createMerchantActions } from "@ucp/onchain/rpc/actions/merchant";

const router = createRpcRouter(createMerchantActions({ chainId }));
const result = await router.request({
  method: "merchant_prepareCheckout",
  params: [
    {
      paymentInfo,
      amount,
      tokenCollector,
      collectorData,
    },
  ],
});
```

## Exports

- `@ucp/onchain` (root): main helpers (`createAnvilClients`, `toPaymentInfo`, etc.)
- `@ucp/onchain/evm/*`: low-level EVM helpers
- `@ucp/onchain/rpc/*`: RPC schema/router/actions
