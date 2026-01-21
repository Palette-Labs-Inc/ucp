#!/usr/bin/env bash
set -euo pipefail

compose_file="${1:-}"
env_file="${2:-}"
rpc_url="${3:-}"
deployer_key="${4:-}"
buyer_amount="${5:-}"
account_count="${6:-}"

if [[ -z "$compose_file" || -z "$env_file" || -z "$rpc_url" || -z "$deployer_key" || -z "$buyer_amount" || -z "$account_count" ]]; then
  echo "Usage: $0 <compose-file> <env-file> <rpc-url> <deployer-key> <buyer-amount> <account-count>"
  exit 1
fi

deployer_address="$(docker compose --env-file "$env_file" -f "$compose_file" run --rm \
  foundry "cast wallet address $deployer_key")"

chain_id="$(
  grep -E '^CHAIN_ID=' "$env_file" | tail -n1 | cut -d= -f2 | tr -d '"'
)"
if [[ -z "$chain_id" ]]; then
  echo "CHAIN_ID not found in $env_file"
  exit 1
fi

anvil_mnemonic="$(
  grep -E '^ANVIL_MNEMONIC=' "$env_file" | tail -n1 | cut -d= -f2- | sed 's/^"//;s/"$//'
)"
if [[ -z "$anvil_mnemonic" ]]; then
  echo "ANVIL_MNEMONIC not found in $env_file"
  exit 1
fi

first_account="$(
  docker compose --env-file "$env_file" -f "$compose_file" run --rm \
    foundry "cast wallet address --mnemonic \"$anvil_mnemonic\" --mnemonic-index 0"
)"

docker compose --env-file "$env_file" -f "$compose_file" run --rm \
  -e DEPLOYER_PRIVATE_KEY="$deployer_key" \
  -e BUYER_ADDRESS="$first_account" \
  -e BUYER_AMOUNT="$buyer_amount" \
  foundry "cd /repo/contracts/vendor/commerce-payments && \
  forge script script/DeployMockToken.s.sol:DeployMockToken \
  --rpc-url $rpc_url --broadcast --sender $deployer_address --private-key $deployer_key"

token_address="$(node -e "const fs=require('fs'); const path='contracts/vendor/commerce-payments/broadcast/DeployMockToken.s.sol/${chain_id}/run-latest.json'; const raw=JSON.parse(fs.readFileSync(path,'utf-8')); const tx=(raw.transactions||[]).find((t)=>t.contractName==='MockERC3009Token'&&t.contractAddress); if(!tx) { throw new Error('MockERC3009Token address missing in '+path); } process.stdout.write(tx.contractAddress);")"

for ((i=1; i<account_count; i++)); do
  account_address="$(
    docker compose --env-file "$env_file" -f "$compose_file" run --rm \
      foundry "cast wallet address --mnemonic \"$anvil_mnemonic\" --mnemonic-index $i"
  )"
  docker compose --env-file "$env_file" -f "$compose_file" run --rm \
    foundry "cast send $token_address 'mint(address,uint256)' $account_address $buyer_amount \
    --rpc-url $rpc_url --private-key $deployer_key"
done
