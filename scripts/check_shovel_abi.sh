#!/usr/bin/env bash
set -euo pipefail

identity_abi_file="${1:-}"
identity_event_name="${2:-}"
payments_abi_file="${3:-}"
payments_event_name="${4:-}"

if [[ -z "$identity_abi_file" || -z "$identity_event_name" || -z "$payments_abi_file" || -z "$payments_event_name" ]]; then
  echo "Usage: $0 <identity-abi> <identity-event> <payments-abi> <payments-event>"
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

jq -e '.abi[] | select(.type=="event" and .name=="'"${identity_event_name}"'")' \
  "$identity_abi_file" >/dev/null
jq -e '.abi[] | select(.type=="event" and .name=="'"${payments_event_name}"'")' \
  "$payments_abi_file" >/dev/null

echo "OK: events ${identity_event_name}, ${payments_event_name} found in ABI"
