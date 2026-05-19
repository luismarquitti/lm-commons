#!/usr/bin/env bash
# Configura um GitHub Project v2 a partir de um JSON de config.
#
# Uso:
#   setup_project.sh <project_v2_config.json> [--apply]
#
# O JSON segue o schema em assets/project_v2_config_template.json.
# Por padrão imprime o plano (dry-run). Use --apply para executar.
#
# Limitações conhecidas:
#   - Iteration fields e views customizadas exigem GraphQL (fazemos via gh api graphql).
#   - Algumas opções de view (filter complexo, agrupamento composto) podem precisar
#     de ajuste manual na UI — o script imprime o link no final.

set -euo pipefail

CONFIG="${1:-}"
APPLY=0
[[ "${2:-}" == "--apply" ]] && APPLY=1

[[ -z "$CONFIG" ]] && { echo "Uso: $0 <project_v2_config.json> [--apply]" >&2; exit 1; }
[[ -f "$CONFIG" ]] || { echo "[erro] config não encontrado: $CONFIG" >&2; exit 1; }

jq_q() { python3 -c 'import sys,json;d=json.load(open(sys.argv[1]));print(eval("d"+sys.argv[2]))' "$CONFIG" "$1"; }

TITLE=$(jq_q '["title"]')
OWNER=$(jq_q '["owner"]')
OWNER_TYPE=$(jq_q '["owner_type"]')   # "user" | "org"

echo "[plano] Project: \"$TITLE\" para $OWNER_TYPE='$OWNER' — modo: $([[ $APPLY -eq 1 ]] && echo APPLY || echo dry-run)"

# 1) Criar o project
if [[ $APPLY -eq 1 ]]; then
  proj_json=$(gh project create --owner "$OWNER" --title "$TITLE" --format json)
  PROJECT_ID=$(echo "$proj_json" | python3 -c 'import sys,json;print(json.load(sys.stdin)["id"])')
  PROJECT_NUMBER=$(echo "$proj_json" | python3 -c 'import sys,json;print(json.load(sys.stdin)["number"])')
  echo "  [ok] project criado: #$PROJECT_NUMBER (id=$PROJECT_ID)"
else
  echo "  [dry] gh project create --owner $OWNER --title \"$TITLE\""
  PROJECT_ID="PVT_DRYRUN"
  PROJECT_NUMBER="?"
fi

# 2) Criar fields
fields_count=$(python3 -c 'import sys,json;print(len(json.load(open(sys.argv[1]))["fields"]))' "$CONFIG")
echo "[plano] $fields_count fields a criar"

python3 - "$CONFIG" <<'PY' | while IFS=$'\t' read -r ftype name opts duration; do
import json, sys
cfg = json.load(open(sys.argv[1]))
for f in cfg["fields"]:
    ftype = f["type"]
    name = f["name"]
    if ftype == "SINGLE_SELECT":
        opts = ",".join(f.get("options", []))
        print(f"SINGLE_SELECT\t{name}\t{opts}\t")
    elif ftype == "NUMBER":
        print(f"NUMBER\t{name}\t\t")
    elif ftype == "DATE":
        print(f"DATE\t{name}\t\t")
    elif ftype == "TEXT":
        print(f"TEXT\t{name}\t\t")
    elif ftype == "ITERATION":
        dur = f.get("duration_days", 14)
        iters = ";".join(f'{it["title"]}|{it["start_date"]}' for it in f.get("iterations", []))
        print(f"ITERATION\t{name}\t{iters}\t{dur}")
PY
  case "$ftype" in
    SINGLE_SELECT)
      if [[ $APPLY -eq 1 ]]; then
        gh project field-create "$PROJECT_NUMBER" --owner "$OWNER" \
          --name "$name" --data-type SINGLE_SELECT \
          --single-select-options "$opts" >/dev/null
        echo "  [ok] field '$name' (single-select)"
      else
        echo "  [dry] field-create '$name' single-select options=[$opts]"
      fi
      ;;
    NUMBER|DATE|TEXT)
      if [[ $APPLY -eq 1 ]]; then
        gh project field-create "$PROJECT_NUMBER" --owner "$OWNER" \
          --name "$name" --data-type "$ftype" >/dev/null
        echo "  [ok] field '$name' ($ftype)"
      else
        echo "  [dry] field-create '$name' $ftype"
      fi
      ;;
    ITERATION)
      # CLI atual não suporta iteration field — cair para GraphQL.
      if [[ $APPLY -eq 1 ]]; then
        # Cria o field
        field_id=$(gh api graphql -f query='
          mutation($pid:ID!,$name:String!){
            createProjectV2Field(input:{projectId:$pid,dataType:ITERATION,name:$name}){
              projectV2Field{ ... on ProjectV2IterationField { id name } }
            }
          }' -F pid="$PROJECT_ID" -F name="$name" \
          --jq '.data.createProjectV2Field.projectV2Field.id')
        echo "  [ok] field '$name' (iteration, id=$field_id)"
        echo "       Iterações configuradas via UI ou GraphQL extra — start_dates: $opts (duração $duration dias)"
      else
        echo "  [dry] graphql createProjectV2Field ITERATION '$name' iters=[$opts] dur=$duration"
      fi
      ;;
  esac
done

# 3) Views — esboço (algumas só via GraphQL e UI ajuste fino)
views_count=$(python3 -c 'import sys,json;print(len(json.load(open(sys.argv[1]))["views"]))' "$CONFIG")
echo "[plano] $views_count views planejadas"
python3 - "$CONFIG" <<'PY' | while IFS=$'\t' read -r vname vlayout vfilter vgroup; do
import json, sys
cfg = json.load(open(sys.argv[1]))
for v in cfg["views"]:
    print(f"{v['name']}\t{v.get('layout','BOARD_LAYOUT')}\t{v.get('filter','')}\t{v.get('group_by','')}")
PY
  echo "  [view] '$vname' layout=$vlayout filter=$vfilter group_by=$vgroup"
  if [[ $APPLY -eq 1 ]]; then
    # createProjectV2View tem suporte limitado a algumas opções; criamos o esqueleto.
    gh api graphql -f query='
      mutation($pid:ID!,$name:String!,$layout:ProjectV2ViewLayout!){
        createProjectV2View(input:{projectId:$pid,name:$name,layout:$layout}){
          projectV2View{ id name }
        }
      }' -F pid="$PROJECT_ID" -F name="$vname" -F layout="$vlayout" >/dev/null 2>&1 || \
      echo "    [aviso] view '$vname' criada parcialmente — ajuste filter/group_by na UI."
  fi
done

# 4) Auto-add (se especificado)
auto_repos=$(python3 -c 'import sys,json;d=json.load(open(sys.argv[1])).get("auto_add",{});print(" ".join(d.get("repos",[])))' "$CONFIG")
if [[ -n "$auto_repos" ]]; then
  echo "[plano] auto-add para repos: $auto_repos"
  echo "  [aviso] auto-add deve ser configurado via UI do project (Workflows > Auto-add). API ainda limitada."
fi

# 5) Link final
if [[ $APPLY -eq 1 ]]; then
  if [[ "$OWNER_TYPE" == "user" ]]; then
    URL="https://github.com/users/$OWNER/projects/$PROJECT_NUMBER"
  else
    URL="https://github.com/orgs/$OWNER/projects/$PROJECT_NUMBER"
  fi
  echo "[fim] Project pronto: $URL"
else
  echo "[fim] dry-run — nada foi criado. Re-rode com --apply."
fi
