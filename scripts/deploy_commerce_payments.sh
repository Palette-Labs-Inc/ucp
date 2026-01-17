#!/usr/bin/env bash
set -euo pipefail

compose_file="${1:-}"
env_file="${2:-}"
rpc_url="${3:-}"
deployer_key="${4:-}"
commerce_dir="${5:-}"
chain_id="${6:-}"

if [[ -z "$compose_file" || -z "$env_file" || -z "$rpc_url" || -z "$deployer_key" || -z "$commerce_dir" || -z "$chain_id" ]]; then
  echo "Usage: $0 <compose-file> <env-file> <rpc-url> <deployer-key> <commerce-dir> <chain-id>"
  exit 1
fi

deployer_address="$(cast wallet address "$deployer_key")"

docker compose --env-file "$env_file" -f "$compose_file" run --rm \
  -e DEPLOYER_PRIVATE_KEY="$deployer_key" \
  foundry "cd /repo/contracts/vendor/commerce-payments && \
  forge script script/Deploy.s.sol:Deploy \
  --rpc-url $rpc_url --broadcast --sender $deployer_address --private-key $deployer_key"

./scripts/update_payments_env.sh "$env_file" "$commerce_dir" "$chain_id"
