#!/usr/bin/env bash
# Cria milestones de sprint em um repo. Idempotente (pula se já existir).
#
# Uso:
#   create_milestones.sh <milestones.yml> <owner/repo> [--apply]
#
# Formato YAML:
#   milestones:
#     - title: "sprint-01"
#       due_on: "2026-05-26T23:59:59Z"
#       description: "Sprint 01 — Foundations"
#     - title: "sprint-02"
#       due_on: "2026-06-09T23:59:59Z"
#       description: "Sprint 02 — Onboarding"

set -euo pipefail

YAML_FILE="${1:-}"
REPO="${2:-}"
APPLY=0
[[ "${3:-}" == "--apply" ]] && APPLY=1

if [[ -z "$YAML_FILE" || -z "$REPO" ]]; then
  echo "Uso: $0 <milestones.yml> <owner/repo> [--apply]" >&2
  exit 1
fi
[[ -f "$YAML_FILE" ]] || { echo "[erro] arquivo não encontrado: $YAML_FILE" >&2; exit 1; }

owner="${REPO%/*}"; name="${REPO#*/}"

gh repo view "$REPO" --json nameWithOwner >/dev/null || {
  echo "[erro] não acessei $REPO." >&2; exit 1
}

parsed=$(python3 - "$YAML_FILE" <<'PY'
import re, sys, json
src = open(sys.argv[1], encoding="utf-8").read()
items, cur = [], None
for line in src.splitlines():
    m = re.match(r'\s*-\s*title:\s*"?(.+?)"?\s*$', line)
    if m:
        if cur: items.append(cur)
        cur = {"title": m.group(1), "due_on": "", "description": ""}
        continue
    m = re.match(r'\s+due_on:\s*"?(.+?)"?\s*$', line)
    if m and cur: cur["due_on"] = m.group(1); continue
    m = re.match(r'\s+description:\s*"?(.+?)"?\s*$', line)
    if m and cur: cur["description"] = m.group(1); continue
if cur: items.append(cur)
print(json.dumps(items))
PY
)

existing=$(gh api "repos/$owner/$name/milestones" --paginate --jq '[.[].title] | .[]' || true)

echo "[plano] $REPO — modo: $([[ $APPLY -eq 1 ]] && echo APPLY || echo dry-run)"

echo "$parsed" | python3 -c 'import sys,json;
for m in json.load(sys.stdin):
    print(f"{m[\"title\"]}\t{m[\"due_on\"]}\t{m[\"description\"]}")' | \
while IFS=$'\t' read -r title due desc; do
  if grep -Fxq "$title" <<< "$existing"; then
    echo "  [skip] $title (já existe)"
    continue
  fi
  if [[ $APPLY -eq 1 ]]; then
    args=( -f "title=$title" -f "state=open" )
    [[ -n "$due" ]] && args+=( -f "due_on=$due" )
    [[ -n "$desc" ]] && args+=( -f "description=$desc" )
    gh api "repos/$owner/$name/milestones" "${args[@]}" >/dev/null
    echo "  [ok] $title (due=$due)"
  else
    echo "  [dry] would create: $title (due=$due, desc=$desc)"
  fi
done

echo "[fim]"
