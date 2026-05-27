#!/usr/bin/env python3
import json
import os
import subprocess
from pathlib import Path

def get_secret(secret_id):
    """Retrieves secret from Bitwarden via secrets.sh"""
    script_path = Path(__file__).parent / "secrets.sh"
    try:
        result = subprocess.run(
            [str(script_path), "get", secret_id],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Warning: Failed to retrieve secret '{secret_id}': {e.stderr}")
        return None

def convert_to_opencode_format(mcp_servers):
    """Convert master_config MCP servers to opencode format."""
    opencode_servers = {}
    for name, config in mcp_servers.items():
        cmd = [config["command"]] + config.get("args", [])
        svr = {
            "type": "local",
            "command": cmd,
            "enabled": True,
            "env": config.get("env", {}),
        }
        opencode_servers[name] = svr
    return opencode_servers


def sync_mcp():
    # Use repo-relative paths instead of fixed $HOME/.ai-commons
    base_dir = Path(__file__).parent.parent.parent.resolve()
    master_config_path = base_dir / "ai-commons" / "config" / "mcp" / "master_config.json"
    
    if not master_config_path.exists():
        print(f"Error: Master config not found at {master_config_path}")
        return

    with open(master_config_path, "r") as f:
        master_data = json.load(f)
        mcp_servers = master_data.get("mcpServers", {})

    # Resolve placeholders in mcp_servers
    # Example: Look for PLACEHOLDER_CONTEXT7 and replace with real key
    context7_key = get_secret("Context7_API_Key")
    if context7_key:
        for server_name, server_config in mcp_servers.items():
            if "args" in server_config:
                server_config["args"] = [
                    arg.replace("PLACEHOLDER_CONTEXT7", context7_key) 
                    for arg in server_config["args"]
                ]

    # Targets to sync - these remain in $HOME as they are local app configs
    home = Path.home()
    targets = [
        home / ".claude.json",
        home / ".gemini" / "settings.json",
        home / ".gemini" / "antigravity" / "mcp_config.json",
    ]

    for target_path in targets:
        # Check if the path exists or its parent exists
        if not target_path.parent.exists():
            continue

        try:
            target_data = {}
            if target_path.exists():
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

    # --- opencode specific sync ---
    opencode_config_path = home / ".config" / "opencode" / "opencode.jsonc"
    if opencode_config_path.parent.exists():
        try:
            target_data = {}
            if opencode_config_path.exists():
                with open(opencode_config_path, "r") as f:
                    target_data = json.load(f)

            # Convert to opencode format and update mcp block
            # Preserve existing enabled/disabled state per server
            existing_mcp = target_data.get("mcp", {})
            opencode_mcp = convert_to_opencode_format(mcp_servers)
            for name, svr in opencode_mcp.items():
                if name in existing_mcp:
                    svr["enabled"] = existing_mcp[name].get("enabled", True)
            target_data["mcp"] = opencode_mcp

            # Save as JSON (opencode accepts .jsonc but writing strict JSON is safe)
            with open(opencode_config_path, "w") as f:
                json.dump(target_data, f, indent=2)
                f.write("\n")

            print(f"Successfully synced MCP config to {opencode_config_path}")
        except Exception as e:
            print(f"Error syncing to {opencode_config_path}: {e}")

if __name__ == "__main__":
    sync_mcp()
