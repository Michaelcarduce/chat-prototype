#!/bin/bash

# Retry mechanism for network operations
retry() {
  local max=5
  local delay=15
  local n=0
  while true; do
    "$@" && break || {
      if [[ $n -lt $max ]]; then
        ((n++))
        echo "Command failed. Retrying ($n/$max)..."
        sleep $delay
      else
        echo "Command failed after $n attempts."
        exit 1
      fi
    }
  done
}

echo "➡️ Installing dependencies..."
retry pnpm install --frozen-lockfile --ignore-scripts --filter client --network-concurrency=1

echo "➡️ Building project..."
pnpm turbo run build --filter=client