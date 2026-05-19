#!/usr/bin/env python3
"""Cria issues em lote em um repositório GitHub via `gh issue create`.

Lê um CSV ou JSON com colunas:
    title, body | body_file, labels, milestone, assignees

Comportamento:
    - Por padrão roda em dry-run: imprime, para cada linha, o comando que SERIA executado.
    - Com --apply, executa de fato via `gh`.
    - Valida que labels e milestone existem no repo antes; se algo falta, lista o que falta e aborta.

Exemplo:
    python create_issues_batch.py issues.csv --repo acme/checkout --dry-run
    python create_issues_batch.py issues.csv --repo acme/checkout --apply
    python create_issues_batch.py issues.json --repo acme/checkout --apply

Requer:
    - gh autenticado (`gh auth status` deve estar OK)
    - Python 3.8+ (somente stdlib)
"""

from __future__ import annotations

import argparse
import csv
import json
import shlex
import subprocess
import sys
from pathlib import Path
from typing import Iterable


def run(cmd: list[str], capture: bool = True) -> subprocess.CompletedProcess:
    """Executa um comando e devolve o CompletedProcess. Em erro, retorna mesmo assim para inspeção."""
    return subprocess.run(
        cmd,
        capture_output=capture,
        text=True,
        check=False,
    )


def gh_repo_check(repo: str) -> None:
    res = run(["gh", "repo", "view", repo, "--json", "nameWithOwner"])
    if res.returncode != 0:
        sys.exit(
            f"[erro] Não consegui acessar o repo '{repo}'. Saída do gh:\n{res.stderr.strip()}\n"
            "Confirme com `gh repo view {repo}` e revise `gh auth status`."
        )


def gh_label_list(repo: str) -> set[str]:
    res = run(["gh", "label", "list", "--repo", repo, "--json", "name", "--limit", "300"])
    if res.returncode != 0:
        sys.exit(f"[erro] Falha ao listar labels:\n{res.stderr.strip()}")
    return {item["name"] for item in json.loads(res.stdout or "[]")}


def gh_milestone_list(repo: str) -> set[str]:
    owner, name = repo.split("/", 1)
    res = run(
        [
            "gh",
            "api",
            f"repos/{owner}/{name}/milestones",
            "--paginate",
            "--jq",
            "[.[].title]",
        ]
    )
    if res.returncode != 0:
        sys.exit(f"[erro] Falha ao listar milestones:\n{res.stderr.strip()}")
    return set(json.loads(res.stdout or "[]"))


def load_rows(path: Path) -> list[dict]:
    if path.suffix.lower() == ".json":
        data = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(data, dict) and "issues" in data:
            data = data["issues"]
        if not isinstance(data, list):
            sys.exit("[erro] JSON deve ser uma lista de objetos ou {'issues': [...]}")
        return data
    if path.suffix.lower() == ".csv":
        with path.open(newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            return [
                {k: (v or "").strip() for k, v in row.items() if k is not None}
                for row in reader
            ]
    sys.exit(f"[erro] Extensão não suportada: {path.suffix}. Use .csv ou .json.")


def normalize_row(row: dict, base_dir: Path) -> dict:
    title = row.get("title", "").strip()
    if not title:
        raise ValueError("linha sem 'title'")

    body = row.get("body", "") or ""
    body_file = row.get("body_file", "").strip()
    if body_file:
        body_path = (base_dir / body_file).resolve()
        if not body_path.exists():
            raise ValueError(f"body_file não encontrado: {body_file}")
        body = body_path.read_text(encoding="utf-8")

    labels = [l.strip() for l in (row.get("labels", "") or "").split(",") if l.strip()]
    milestone = (row.get("milestone", "") or "").strip()
    assignees = [a.strip() for a in (row.get("assignees", "") or "").split(",") if a.strip()]

    return {
        "title": title,
        "body": body,
        "labels": labels,
        "milestone": milestone,
        "assignees": assignees,
    }


def build_gh_command(repo: str, issue: dict, body_path: Path | None) -> list[str]:
    cmd = ["gh", "issue", "create", "--repo", repo, "--title", issue["title"]]
    if body_path is not None:
        cmd += ["--body-file", str(body_path)]
    else:
        cmd += ["--body", issue["body"] or " "]
    if issue["labels"]:
        cmd += ["--label", ",".join(issue["labels"])]
    if issue["milestone"]:
        cmd += ["--milestone", issue["milestone"]]
    for a in issue["assignees"]:
        cmd += ["--assignee", a]
    return cmd


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("source", help="Caminho para issues.csv ou issues.json")
    p.add_argument("--repo", required=True, help="owner/name do repositório alvo")
    grp = p.add_mutually_exclusive_group()
    grp.add_argument("--dry-run", action="store_true", default=True, help="(default) Só mostra o que faria")
    grp.add_argument("--apply", action="store_true", help="Executa de fato as criações")
    p.add_argument("--continue-on-error", action="store_true", help="Continua se uma issue falhar")
    args = p.parse_args()

    source = Path(args.source).resolve()
    if not source.exists():
        sys.exit(f"[erro] arquivo não encontrado: {source}")

    # 1) Sanidade do repo e do gh
    gh_repo_check(args.repo)

    # 2) Carrega e normaliza
    rows = load_rows(source)
    issues: list[dict] = []
    for i, row in enumerate(rows, start=1):
        try:
            issues.append(normalize_row(row, source.parent))
        except ValueError as e:
            sys.exit(f"[erro] linha {i}: {e}")

    if not issues:
        sys.exit("[erro] Nenhuma issue para criar (arquivo vazio?)")

    # 3) Diff de labels / milestones
    existing_labels = gh_label_list(args.repo)
    existing_milestones = gh_milestone_list(args.repo)
    needed_labels = sorted({l for it in issues for l in it["labels"]})
    needed_milestones = sorted({it["milestone"] for it in issues if it["milestone"]})
    missing_labels = [l for l in needed_labels if l not in existing_labels]
    missing_milestones = [m for m in needed_milestones if m not in existing_milestones]

    print(f"[plano] Repo: {args.repo}")
    print(f"[plano] Issues a criar: {len(issues)}")
    print(f"[plano] Labels necessárias: {len(needed_labels)} (faltam {len(missing_labels)})")
    if missing_labels:
        print("        Labels faltando:", ", ".join(missing_labels))
        print("        Rode `apply_labels.sh` ANTES desta etapa, ou as criações falharão.")
    print(f"[plano] Milestones necessários: {len(needed_milestones)} (faltam {len(missing_milestones)})")
    if missing_milestones:
        print("        Milestones faltando:", ", ".join(missing_milestones))
        print("        Rode `create_milestones.sh` antes.")

    if (missing_labels or missing_milestones) and args.apply:
        sys.exit("[abort] Há dependências faltando — recuso aplicar. Crie labels/milestones primeiro.")

    apply = args.apply
    if not apply:
        print("\n[dry-run] Os comandos abaixo seriam executados. Use --apply para criar de verdade.")

    failures: list[tuple[int, str]] = []
    for i, issue in enumerate(issues, start=1):
        # Para preservar quebras de linha e markdown, escrevemos o body em tmp
        if apply:
            tmp = source.parent / f".__issue_body_{i}.md"
            tmp.write_text(issue["body"] or " ", encoding="utf-8")
            cmd = build_gh_command(args.repo, issue, tmp)
        else:
            cmd = build_gh_command(args.repo, issue, None)

        print(f"\n[{i}/{len(issues)}] {issue['title']}")
        print("  $ " + " ".join(shlex.quote(c) for c in cmd))

        if apply:
            res = run(cmd, capture=True)
            try:
                tmp.unlink(missing_ok=True)  # type: ignore[arg-type]
            except Exception:
                pass
            if res.returncode != 0:
                msg = res.stderr.strip() or res.stdout.strip()
                print(f"  [falhou] {msg}")
                failures.append((i, msg))
                if not args.continue_on_error:
                    sys.exit(f"[abort] Falha na issue #{i}. Use --continue-on-error para seguir.")
            else:
                url = (res.stdout or "").strip()
                print(f"  [ok] {url}")

    if failures:
        print(f"\n[resumo] {len(failures)} falha(s). Revise antes de re-rodar.")
        return 1

    print("\n[ok] Concluído." + ("" if apply else " (dry-run — nada foi criado)"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
