#!/usr/bin/env bash
set -euo pipefail

compose_file="${1:-}"
if [[ -z "$compose_file" ]]; then
  echo "Usage: $0 <compose-file>"
  exit 1
fi

docker compose -f "$compose_file" logs -f
