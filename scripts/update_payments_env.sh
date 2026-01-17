#!/usr/bin/env bash
set -euo pipefail

env_file="${1:-}"
commerce_dir="${2:-}"
chain_id="${3:-}"

if [[ -z "$env_file" || -z "$commerce_dir" || -z "$chain_id" ]]; then
  echo "Usage: $0 <env-file> <commerce-payments-dir> <chain-id>"
  exit 1
fi

broadcast_file="${commerce_dir}/broadcast/Deploy.s.sol/${chain_id}/run-latest.json"
if [[ ! -f "$broadcast_file" ]]; then
  echo "Missing broadcast file: ${broadcast_file}"
  exit 1
fi

escrow_address="$(
  python3 - <<'PY' "$broadcast_file"
import json
import sys

path = sys.argv[1]
with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

address = None
for tx in data.get("transactions", []):
    if tx.get("contractName") == "AuthCaptureEscrow":
        address = tx.get("contractAddress")
        if address:
            break

print(address or "")
PY
)"

if [[ -z "$escrow_address" ]]; then
  echo "Unable to resolve AuthCaptureEscrow address from ${broadcast_file}"
  exit 1
fi

touch "$env_file"

python3 - <<'PY' "$env_file" "$escrow_address"
import sys

env_path = sys.argv[1]
address = sys.argv[2]

with open(env_path, "r", encoding="utf-8") as f:
    lines = f.read().splitlines()

updated = False
for i, line in enumerate(lines):
    if line.startswith("PAYMENTS_ESCROW_ADDRESS="):
        lines[i] = f"PAYMENTS_ESCROW_ADDRESS={address}"
        updated = True
        break

if not updated:
    lines.append(f"PAYMENTS_ESCROW_ADDRESS={address}")

with open(env_path, "w", encoding="utf-8") as f:
    f.write("\n".join(lines).rstrip() + "\n")
PY

echo "PAYMENTS_ESCROW_ADDRESS=${escrow_address}"
