#!/usr/bin/env bash
set -euo pipefail

compose_file="${1:-}"
env_file="${2:-}"
rpc_url="${3:-}"
deployer_key="${4:-}"
buyer_address="${5:-}"
buyer_amount="${6:-}"

if [[ -z "$compose_file" || -z "$env_file" || -z "$rpc_url" || -z "$deployer_key" || -z "$buyer_address" || -z "$buyer_amount" ]]; then
  echo "Usage: $0 <compose-file> <env-file> <rpc-url> <deployer-key> <buyer-address> <buyer-amount>"
  exit 1
fi

deployer_address="$(docker compose --env-file "$env_file" -f "$compose_file" run --rm \
  foundry "cast wallet address $deployer_key")"

docker compose --env-file "$env_file" -f "$compose_file" run --rm \
  -e DEPLOYER_PRIVATE_KEY="$deployer_key" \
  -e BUYER_ADDRESS="$buyer_address" \
  -e BUYER_AMOUNT="$buyer_amount" \
  foundry "cd /repo/contracts/vendor/commerce-payments && \
  forge script script/DeployMockToken.s.sol:DeployMockToken \
  --rpc-url $rpc_url --broadcast --sender $deployer_address --private-key $deployer_key"
