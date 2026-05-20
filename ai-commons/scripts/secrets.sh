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

    local env_file
    env_file=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/.env
    
    # Normalize secret_id to environment variable format (e.g. Context7_API_Key -> CONTEXT7_API_KEY)
    local env_var_name
    env_var_name=$(echo "$secret_id" | tr '[:lower:]' '[:upper:]' | tr '-' '_')

    # 1. Try to read from environment variable
    if [[ -n "${!env_var_name}" ]]; then
        echo -n "${!env_var_name}"
        return 0
    fi

    # 2. Try to read from .env file
    if [[ -f "$env_file" ]]; then
        local value
        value=$(grep -E "^${env_var_name}=" "$env_file" | cut -d'=' -f2-)
        if [[ -n "$value" ]]; then
            # Remove potential surrounding quotes
            value="${value%\"}"
            value="${value#\"}"
            value="${value%\'}"
            value="${value#\'}"
            echo -n "$value"
            return 0
        fi
    fi

    # Check if bw CLI is available
    if ! command -v bw &> /dev/null; then
        echo "Error: Bitwarden CLI ('bw') not found in PATH and '$secret_id' not found in env/.env." >&2
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
