#!/usr/bin/env bash
# Aplica um esquema de labels (YAML) em um repositório, de forma idempotente.
#
# Uso:
#   apply_labels.sh <labels.yml> <owner/repo> [--prune] [--dry-run]
#
# Por padrão é dry-run. Use sem --dry-run para aplicar.
# --prune deleta labels não listadas no YAML. Use com extrema cautela.
#
# Requer: gh autenticado, Python 3 (apenas stdlib).

set -euo pipefail

usage() {
  cat <<EOF
Uso: $0 <labels.yml> <owner/repo> [--prune] [--apply]

Por padrão roda em dry-run. Passe --apply para aplicar de fato.
EOF
  exit 1
}

YAML_FILE="${1:-}"
REPO="${2:-}"
shift 2 || true
PRUNE=0
APPLY=0
for arg in "$@"; do
  case "$arg" in
    --prune) PRUNE=1 ;;
    --apply) APPLY=1 ;;
    --dry-run) APPLY=0 ;;
    *) echo "argumento desconhecido: $arg" >&2; usage ;;
  esac
done

[[ -z "$YAML_FILE" || -z "$REPO" ]] && usage
[[ -f "$YAML_FILE" ]] || { echo "[erro] arquivo não encontrado: $YAML_FILE" >&2; exit 1; }

# Confirma repo
gh repo view "$REPO" --json nameWithOwner >/dev/null || {
  echo "[erro] não acessei $REPO. Verifique com gh repo view $REPO" >&2; exit 1
}

# Parse leve do YAML (stdlib Python). Espera estrutura:
# labels:
#   - name: "..."
#     color: "..."
#     description: "..."
parsed=$(python3 - "$YAML_FILE" <<'PY'
import re, sys, json
src = open(sys.argv[1], encoding="utf-8").read()
labels = []
cur = None
for line in src.splitlines():
    m = re.match(r'\s*-\s*name:\s*"?(.+?)"?\s*$', line)
    if m:
        if cur: labels.append(cur)
        cur = {"name": m.group(1), "color": "ededed", "description": ""}
        continue
    m = re.match(r'\s+color:\s*"?(.+?)"?\s*$', line)
    if m and cur:
        cur["color"] = m.group(1).lstrip("#")
        continue
    m = re.match(r'\s+description:\s*"?(.+?)"?\s*$', line)
    if m and cur:
        cur["description"] = m.group(1)
        continue
if cur: labels.append(cur)
print(json.dumps(labels))
PY
)

count=$(echo "$parsed" | python3 -c 'import sys,json;print(len(json.load(sys.stdin)))')
echo "[plano] $count labels no YAML, repo: $REPO, modo: $([[ $APPLY -eq 1 ]] && echo APPLY || echo dry-run)$([[ $PRUNE -eq 1 ]] && echo ', com --prune' || echo '')"

# Lista atuais
existing=$(gh label list --repo "$REPO" --json name --limit 300 | python3 -c 'import sys,json;print("\n".join(x["name"] for x in json.load(sys.stdin)))')

apply_one() {
  local name="$1" color="$2" desc="$3"
  if [[ $APPLY -eq 1 ]]; then
    gh label create "$name" --repo "$REPO" --color "$color" --description "$desc" --force >/dev/null
    echo "  [ok] $name"
  else
    echo "  [dry] would create/update: $name  (color=#$color)"
  fi
}

# Cria/atualiza
echo "$parsed" | python3 - <<'PY' > /tmp/_labels_plan.txt
import sys, json
data = json.load(sys.stdin)
for l in data:
    print(f"{l['name']}\t{l['color']}\t{l['description']}")
PY

declare -A in_yaml=()
while IFS=$'\t' read -r name color desc; do
  in_yaml["$name"]=1
  apply_one "$name" "$color" "$desc"
done < /tmp/_labels_plan.txt

# Prune
if [[ $PRUNE -eq 1 ]]; then
  echo "[prune] Verificando labels a remover..."
  while IFS= read -r ex; do
    [[ -z "$ex" ]] && continue
    if [[ -z "${in_yaml[$ex]:-}" ]]; then
      if [[ $APPLY -eq 1 ]]; then
        gh label delete "$ex" --repo "$REPO" --yes
        echo "  [del] $ex"
      else
        echo "  [dry] would delete: $ex"
      fi
    fi
  done <<< "$existing"
fi

rm -f /tmp/_labels_plan.txt
echo "[fim] $([[ $APPLY -eq 1 ]] && echo 'Concluído.' || echo 'dry-run — nada foi alterado.')"
