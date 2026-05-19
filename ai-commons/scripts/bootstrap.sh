#!/bin/bash
set -e

BASE_DIR=\$(cd "\$(dirname "\$0")/../.." && pwd)
SCRIPTS_DIR="\$BASE_DIR/ai-commons/scripts"

echo "=== lm-commons Bootstrap ==="

# 1. Install GNU Stow if missing
if ! command -v stow &> /dev/null; then
    echo "Installing GNU Stow..."
    sudo apt-get update && sudo apt-get install -y stow
fi

# 2. Apply Stow packages
echo "Applying Stow packages..."
cd "\$BASE_DIR/ai-commons/stow-packages"
stow -t "\$HOME" claude agents gemini

# 3. Regenerate tool configs
echo "Regenerating tool configs..."
python3 "\$SCRIPTS_DIR/sync-mcp.py"

# 4. Run verification
echo "Running environment verification..."
bash "\$SCRIPTS_DIR/verify-env.sh"

echo "=== Bootstrap Complete ==="
