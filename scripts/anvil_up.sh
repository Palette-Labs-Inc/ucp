#!/usr/bin/env bash
set -euo pipefail

compose_file="${1:-}"
mode="${2:-detached}"
if [[ -z "$compose_file" ]]; then
  echo "Usage: $0 <compose-file> [detached|foreground]"
  exit 1
fi

if [[ "$mode" == "foreground" ]]; then
  docker compose -f "$compose_file" up
  exit 0
fi

docker compose -f "$compose_file" up -d
