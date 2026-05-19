#!/bin/bash
BASE_DIR=$(cd "$(dirname "$0")/../.." && pwd)

echo "=== Environment Verification ==="

# Check for broken symlinks in $HOME
echo "Checking symlinks..."
find "$HOME" -maxdepth 1 -xtype l -name ".*" | while read -r link; do
    echo "Broken symlink found: $link"
done

# Check if master_config has plaintext keys (quick grep for ctx7sk-)
echo "Checking for plaintext secrets..."
if grep -q "ctx7sk-" "$BASE_DIR/ai-commons/config/mcp/master_config.json"; then
    echo "WARNING: Plaintext Context7 key found in master_config.json!"
fi

# Check if secrets.sh is executable
if [[ ! -x "$BASE_DIR/ai-commons/scripts/secrets.sh" ]]; then
    echo "ERROR: secrets.sh is not executable!"
fi

echo "Verification complete."
