#!/bin/bash
set -e

BASE_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
SECRETS_SCRIPT="$BASE_DIR/ai-commons/scripts/secrets.sh"

# Export known secrets as env vars for opencode MCP servers
# This allows opencode to use ${VAR} syntax in MCP server definitions

# Source secrets.sh for the function
source "$SECRETS_SCRIPT"

# Export secrets needed by MCP servers
CONTEXT7_KEY=$(secrets_get "Context7_API_Key" 2>/dev/null || echo "")
if [ -n "$CONTEXT7_KEY" ]; then
    export CONTEXT7_API_KEY="$CONTEXT7_KEY"
    echo "  ✓ Exported CONTEXT7_API_KEY"
fi

# Run opencode with exported env vars
exec opencode "$@"
