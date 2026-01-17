#!/usr/bin/env bash
set -euo pipefail

compose_file="${1:-}"
env_file="${2:-}"
if [[ -z "$compose_file" ]]; then
  echo "Usage: $0 <compose-file> [env-file]"
  exit 1
fi

env_args=()
if [[ -n "$env_file" ]]; then
  env_args=(--env-file "$env_file")
fi

docker compose "${env_args[@]}" -f "$compose_file" down
