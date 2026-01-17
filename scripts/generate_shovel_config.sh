#!/usr/bin/env bash
set -euo pipefail

env_file="${1:-}"
template_file="${2:-}"
output_file="${3:-}"
identity_abi_file="${4:-}"
identity_event_name="${5:-}"
payments_abi_file="${6:-}"
payments_event_name="${7:-}"

if [[ -z "$env_file" || -z "$template_file" || -z "$output_file" || -z "$identity_abi_file" || -z "$identity_event_name" || -z "$payments_abi_file" || -z "$payments_event_name" ]]; then
  echo "Usage: $0 <env-file> <template> <output> <identity-abi> <identity-event> <payments-abi> <payments-event>"
  exit 1
fi

if [[ ! -f "$env_file" ]]; then
  echo "Missing env file: ${env_file}"
  exit 1
fi

if [[ ! -f "$template_file" ]]; then
  echo "Missing template file: ${template_file}"
  exit 1
fi

if [[ ! -f "$identity_abi_file" ]]; then
  echo "Missing identity ABI file: ${identity_abi_file}"
  exit 1
fi

if [[ ! -f "$payments_abi_file" ]]; then
  echo "Missing payments ABI file: ${payments_abi_file}"
  exit 1
fi

set -a
. "$env_file"
set +a

if [[ -z "${IDENTITY_REGISTRY_ADDRESS:-}" || "${IDENTITY_REGISTRY_ADDRESS}" == "0x0000000000000000000000000000000000000000" ]]; then
  echo "Missing IDENTITY_REGISTRY_ADDRESS in ${env_file}"
  exit 1
fi

if [[ -z "${PAYMENTS_ESCROW_ADDRESS:-}" || "${PAYMENTS_ESCROW_ADDRESS}" == "0x0000000000000000000000000000000000000000" ]]; then
  echo "Missing PAYMENTS_ESCROW_ADDRESS in ${env_file}"
  exit 1
fi

jq -e '.abi[] | select(.type=="event" and .name=="'"${identity_event_name}"'")' \
  "$identity_abi_file" >/dev/null || {
  echo "Event ${identity_event_name} not found in ${identity_abi_file}"
  exit 1
}

jq -e '.abi[] | select(.type=="event" and .name=="'"${payments_event_name}"'")' \
  "$payments_abi_file" >/dev/null || {
  echo "Event ${payments_event_name} not found in ${payments_abi_file}"
  exit 1
}

mkdir -p "$(dirname "$output_file")"
echo "Generating ${output_file} from ${template_file}..."
envsubst < "$template_file" | \
  jq '.eth_sources[0].chain_id |= tonumber \
      | .integrations[0].sources[0].start |= tonumber \
      | .integrations[1].sources[0].start |= tonumber' \
  > "$output_file"
