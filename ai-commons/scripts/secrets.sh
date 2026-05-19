#!/bin/bash

# secrets.sh - Bitwarden retrieval interface for lm-commons
# This script serves as the single retrieval interface for every secret consumed by lm-commons.

set -e

function secrets_get() {
    local secret_id="$1"
    
    if [[ -z "$secret_id" ]]; then
        echo "Error: No secret identifier provided." >&2
        return 1
    fi

    # Check if bw CLI is available
    if ! command -v bw &> /dev/null; then
        echo "Error: Bitwarden CLI ('bw') not found in PATH." >&2
        return 1
    fi

    # Check if vault is unlocked
    local status
    status=$(bw status | grep -oP '"status":"\K[^"]+')
    
    if [[ "$status" != "unlocked" ]]; then
        echo "Error: Bitwarden vault is $status. Please ensure it is unlocked and BW_SESSION is exported." >&2
        return 1
    fi

    # Retrieve password using bw CLI
    local value
    value=$(bw get password "$secret_id" 2>/dev/null)
    
    if [[ $? -ne 0 || -z "$value" ]]; then
        echo "Error: Could not retrieve secret '$secret_id'. Item missing or access denied." >&2
        return 1
    fi

    echo -n "$value"
}

# If the script is sourced, the function is available to the caller.
# If called directly with 'get <id>', it outputs the secret.
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    if [[ "$1" == "get" ]]; then
        secrets_get "$2"
    else
        echo "Usage: $0 get <secret_id>"
        exit 1
    fi
fi
