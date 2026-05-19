#!/usr/bin/env python3
import json
import os
from pathlib import Path

def sync_mcp():
    home = Path.home()
    ai_commons_dir = home / ".ai-commons"
    master_config_path = ai_commons_dir / "config" / "mcp" / "master_config.json"
    
    if not master_config_path.exists():
        print(f"Error: Master config not found at {master_config_path}")
        return

    with open(master_config_path, "r") as f:
        master_data = json.load(f)
        mcp_servers = master_data.get("mcpServers", {})

    # Targets to sync
    targets = [
        home / ".claude.json",
        home / ".gemini" / "settings.json"
    ]

    for target_path in targets:
        if not target_path.exists():
            print(f"Skipping: {target_path} (not found)")
            continue

        try:
            with open(target_path, "r") as f:
                target_data = json.load(f)

            # Update mcpServers block
            target_data["mcpServers"] = mcp_servers
            
            # Save updated config
            with open(target_path, "w") as f:
                json.dump(target_data, f, indent=2)
            
            print(f"Successfully synced MCP config to {target_path}")
        except Exception as e:
            print(f"Error syncing to {target_path}: {e}")

if __name__ == "__main__":
    sync_mcp()
