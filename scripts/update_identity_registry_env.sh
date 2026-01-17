#!/usr/bin/env bash
set -euo pipefail

env_file="${1:-}"
erc8004_dir="${2:-}"
chain_id="${3:-}"

if [[ -z "$env_file" || -z "$erc8004_dir" || -z "$chain_id" ]]; then
  echo "Usage: $0 <env-file> <erc8004-dir> <chain-id>"
  exit 1
fi

registry_file="${erc8004_dir}/broadcast/DeployIdentityRegistry.s.sol/${chain_id}/run-latest.json"
if [[ ! -f "$registry_file" ]]; then
  echo "Missing registry file: ${registry_file}"
  exit 1
fi

registry_address="$(
  python3 - <<'PY' "$registry_file"
import json
import sys

path = sys.argv[1]
with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

address = None
for tx in data.get("transactions", []):
    if tx.get("contractName") == "IdentityRegistry":
        address = tx.get("contractAddress")
        if address:
            break
print(address or "")
PY
)"

if [[ -z "$registry_address" ]]; then
  echo "Unable to resolve IdentityRegistry address from ${registry_file}"
  exit 1
fi

touch "$env_file"

python3 - <<'PY' "$env_file" "$registry_address"
import sys

env_path = sys.argv[1]
address = sys.argv[2]

with open(env_path, "r", encoding="utf-8") as f:
    lines = f.read().splitlines()

updated = False
for i, line in enumerate(lines):
    if line.startswith("IDENTITY_REGISTRY_ADDRESS="):
        lines[i] = f"IDENTITY_REGISTRY_ADDRESS={address}"
        updated = True
        break

if not updated:
    lines.append(f"IDENTITY_REGISTRY_ADDRESS={address}")

with open(env_path, "w", encoding="utf-8") as f:
    f.write("\n".join(lines).rstrip() + "\n")
PY

echo "IDENTITY_REGISTRY_ADDRESS=${registry_address}"
