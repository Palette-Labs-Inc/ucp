#!/usr/bin/env bash
set -euo pipefail

compose_file="${1:-}"
env_file="${2:-}"
contracts_config="${3:-}"

if [[ -z "$compose_file" || -z "$env_file" || -z "$contracts_config" ]]; then
  echo "Usage: $0 <compose-file> <env-file> <contracts-config>"
  exit 1
fi

if [[ ! -f "$contracts_config" ]]; then
  echo "Missing contracts config: ${contracts_config}"
  exit 1
fi

while read -r forge_dir; do
  if [[ -z "$forge_dir" ]]; then
    continue
  fi
  docker compose --env-file "$env_file" -f "$compose_file" run --no-deps --rm foundry \
    "cd /repo/${forge_dir} && forge build"
done < <(jq -r '.[].forge_dir' "$contracts_config" | sort -u)
