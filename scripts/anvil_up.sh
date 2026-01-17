#!/usr/bin/env bash
set -euo pipefail

compose_file="${1:-}"
mode="${2:-detached}"
env_file="${3:-}"
shift_count=0
if [[ -n "$compose_file" ]]; then shift_count=$((shift_count + 1)); fi
if [[ -n "$mode" ]]; then shift_count=$((shift_count + 1)); fi
if [[ -n "$env_file" ]]; then shift_count=$((shift_count + 1)); fi
shift "$shift_count"
if [[ -z "$compose_file" ]]; then
  echo "Usage: $0 <compose-file> [detached|foreground] [env-file] [services...]"
  exit 1
fi

env_args=()
if [[ -n "$env_file" ]]; then
  env_args=(--env-file "$env_file")
fi

if [[ "$mode" == "foreground" ]]; then
  docker compose "${env_args[@]}" -f "$compose_file" up "$@"
  exit 0
fi

docker compose "${env_args[@]}" -f "$compose_file" up -d "$@"
