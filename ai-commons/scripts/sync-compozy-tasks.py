#!/usr/bin/env python3
import os
import sys
import json
import argparse
import subprocess
import urllib.request
import urllib.error
from pathlib import Path

def resolve_api_key():
    """Resolves the Linear API Key from Env, .env file, or secrets.sh."""
    # 1. Environment Variable
    api_key = os.environ.get("LINEAR_API_KEY")
    if api_key:
        return api_key
        
    # 2. Dotenv file search (checks current dir and parent dirs)
    cwd = Path.cwd()
    for directory in [cwd] + list(cwd.parents):
        for env_name in [".env", ".env.local"]:
            env_file = directory / env_name
            if env_file.exists():
                with open(env_file, "r", encoding="utf-8") as f:
                    for line in f:
                        if line.strip().startswith("LINEAR_API_KEY="):
                            return line.split("=", 1)[1].strip().strip("'\"")
                        if line.strip().startswith("CONTEXT7_API_KEY="):
                            # Fallback to CONTEXT7_API_KEY if needed, but Linear Key is preferred
                            pass
                            
    # 3. secrets.sh fallback
    secrets_script = cwd / "ai-commons" / "scripts" / "secrets.sh"
    if secrets_script.exists():
        try:
            result = subprocess.run(
                ["bash", str(secrets_script), "get", "Linear_API_Key"],
                capture_output=True,
                text=True,
                check=True
            )
            key = result.stdout.strip()
            if key:
                return key
        except Exception:
            pass
            
    raise ValueError(
        "Linear API Key not found. Please set LINEAR_API_KEY in environment or .env file."
    )

def call_linear_api(query, variables, api_key):
    """Makes a request to the Linear GraphQL API using standard urllib."""
    url = "https://api.linear.app/graphql"
    headers = {
        "Content-Type": "application/json",
        "Authorization": api_key
    }
    data = json.dumps({"query": query, "variables": variables}).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            if "errors" in res_data:
                raise Exception(f"Linear API error: {res_data['errors']}")
            return res_data.get("data", {})
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        raise Exception(f"HTTP Error {e.code}: {body}")

def get_team_states(team_id, api_key):
    """Fetches the workflow states mapping for a team in Linear."""
    query = """
    query TeamStates($teamId: String!) {
      team(id: $teamId) {
        states {
          nodes {
            id
            name
            type
          }
        }
      }
    }
    """
    variables = {"teamId": team_id}
    data = call_linear_api(query, variables, api_key)
    states = data.get("team", {}).get("states", {}).get("nodes", [])
    
    state_map = {}
    for s in states:
        s_id = s["id"]
        s_name = s["name"].lower()
        s_type = s["type"]
        state_map[s_type] = s_id
        state_map[s_name] = s_id
        
    return state_map

def parse_task_file(file_path):
    """Parses YAML frontmatter and markdown body from a task file."""
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    parts = content.split("---", 2)
    if len(parts) < 3:
        raise ValueError(f"Invalid frontmatter format in {file_path}")
        
    frontmatter_text = parts[1]
    body_text = parts[2]
    
    frontmatter = {}
    for line in frontmatter_text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if ":" in line:
            key, val = line.split(":", 1)
            key = key.strip()
            val = val.strip()
            if key == "dependencies":
                val = val.strip("[]").split(",")
                val = [v.strip().strip("'\"") for v in val if v.strip()]
                frontmatter[key] = val
            else:
                val = val.strip("'\"")
                frontmatter[key] = val
                
    return frontmatter, body_text

def write_task_file(file_path, frontmatter, body_text):
    """Writes updated frontmatter and body back to the task file."""
    lines = ["---"]
    for key, val in frontmatter.items():
        if key == "dependencies":
            deps_str = ", ".join([f'"{d}"' for d in val])
            lines.append(f"dependencies: [{deps_str}]")
        else:
            lines.append(f"{key}: {val}")
    lines.append("---")
    
    new_content = "\n".join(lines) + body_text
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)

def map_status_to_state(status, state_map):
    """Maps local task status to a Linear State ID."""
    status = status.lower()
    # Canonical mappings
    if status in ["pending", "todo"]:
        return state_map.get("unstarted") or state_map.get("todo")
    elif status in ["in_progress", "in-progress", "/"]:
        return state_map.get("started") or state_map.get("in progress")
    elif status in ["completed", "done", "x"]:
        return state_map.get("completed") or state_map.get("done")
    return state_map.get("unstarted")

def main():
    parser = argparse.ArgumentParser(
        description="Sync Compozy task files with Linear issues."
    )
    parser.add_argument(
        "--dir",
        required=True,
        help="Path to the directory containing task_*.md files."
    )
    parser.add_argument(
        "--team",
        required=True,
        help="Linear Team ID (e.g. CLE)."
    )
    parser.add_argument(
        "--project",
        help="Linear Project ID (optional)."
    )
    args = parser.parse_args()
    
    task_dir = Path(args.dir)
    if not task_dir.exists() or not task_dir.is_dir():
        print(f"Error: Directory {args.dir} does not exist.", file=sys.stderr)
        sys.exit(1)
        
    try:
        api_key = resolve_api_key()
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
        
    try:
        state_map = get_team_states(args.team, api_key)
    except Exception as e:
        print(f"Error fetching team states: {e}", file=sys.stderr)
        sys.exit(1)
        
    task_files = sorted(list(task_dir.glob("task_*.md")))
    if not task_files:
        print("No task files (task_*.md) found to sync.")
        return
        
    for task_file in task_files:
        print(f"Processing {task_file.name}...")
        try:
            frontmatter, body_text = parse_task_file(task_file)
        except Exception as e:
            print(f"  Failed to parse file: {e}", file=sys.stderr)
            continue
            
        title = frontmatter.get("title")
        status = frontmatter.get("status", "pending")
        issue_id = frontmatter.get("linear_issue_id")
        
        if not title:
            print(f"  Warning: Missing title in {task_file.name}. Skipping.", file=sys.stderr)
            continue
            
        state_id = map_status_to_state(status, state_map)
        
        # Build issue description
        description = f"Local task spec: {task_file.name}\n\n" + body_text.strip()
        
        if not issue_id:
            # Create Issue
            print(f"  Creating new issue: '{title}'...")
            query = """
            mutation IssueCreate($input: IssueCreateInput!) {
              issueCreate(input: $input) {
                success
                issue {
                  id
                  identifier
                  title
                }
              }
            }
            """
            variables = {
              "input": {
                "title": title,
                "description": description,
                "teamId": args.team,
                "stateId": state_id
              }
            }
            if args.project:
                variables["input"]["projectId"] = args.project
                
            try:
                res = call_linear_api(query, variables, api_key)
                create_res = res.get("issueCreate", {})
                if create_res.get("success"):
                    new_issue = create_res.get("issue", {})
                    new_id = new_issue.get("identifier")
                    frontmatter["linear_issue_id"] = new_id
                    write_task_file(task_file, frontmatter, body_text)
                    print(f"  Successfully created issue: {new_id}")
                else:
                    print("  Failed to create issue in Linear.", file=sys.stderr)
            except Exception as e:
                print(f"  API error: {e}", file=sys.stderr)
        else:
            # Update Issue
            print(f"  Updating issue {issue_id}: '{title}'...")
            query = """
            mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) {
              issueUpdate(id: $id, input: $input) {
                success
                issue {
                  id
                  identifier
                }
              }
            }
            """
            variables = {
              "id": issue_id,
              "input": {
                "title": title,
                "description": description,
                "stateId": state_id
              }
            }
            try:
                res = call_linear_api(query, variables, api_key)
                update_res = res.get("issueUpdate", {})
                if update_res.get("success"):
                    print(f"  Successfully updated issue {issue_id}")
                else:
                    print(f"  Failed to update issue {issue_id} in Linear.", file=sys.stderr)
            except Exception as e:
                print(f"  API error: {e}", file=sys.stderr)

if __name__ == "__main__":
    main()
