#!/bin/bash

# Function to retry commands with exponential backoff
retry() {
    local max_attempts=5
    local delay=15
    local attempt=0
    local exitCode=0

    while (( attempt < max_attempts ))
    do
        if "$@"
        then
            exitCode=0
            break
        else
            exitCode=$?
        fi

        (( attempt++ ))
        echo "⚠️ Attempt $attempt failed. Retrying in $delay seconds..."
        sleep $delay
    done

    if [[ $exitCode != 0 ]]
    then
        echo "❌ All $max_attempts attempts failed!"
    fi

    return $exitCode
}

echo "======= STARTING VERCEL BUILD ======="
echo "➡️ Installing dependencies with retry..."
retry pnpm install --frozen-lockfile --ignore-scripts --filter client --network-concurrency=1

echo "➡️ Running build..."
pnpm turbo run build --filter=client

echo "➡️ Build finished with exit code $?"
echo "======= BUILD PROCESS COMPLETE ======="