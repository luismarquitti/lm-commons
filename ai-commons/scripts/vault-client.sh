#!/bin/bash
# vault-client.sh - Ansible vault-password client for lm-commons
# Resolves the vault password from Bitwarden via secrets.sh

SCRIPTS_DIR=$(cd "$(dirname "$0")" && pwd)
bash "$SCRIPTS_DIR/secrets.sh" get "Ansible_Vault_Password"
