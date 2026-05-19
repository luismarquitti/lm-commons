# GSD Conductor Pattern

## Summary
The Conductor pattern is a Spec-Driven Development (SDD) methodology that uses a `conductor/` directory as the absolute Source of Truth for the project. It ensures zero-hallucination development by requiring specs and plans before any code is written.

## Directory Structure
- `conductor/`
  - `product.md`: High-level product vision.
  - `tech-stack.md`: Architecture and technology choices.
  - `workflow.md`: This workflow guide.
  - `tracks/`: Active initiatives.
    - `<feature-name>/`
      - `spec.md`: The "What" (Business rules, requirements).
      - `plan.md`: The "How" (Tactical implementation plan).

## Task Lifecycle (TDD Cycle)
1. **Mark [~]**: Update `plan.md` to show task is in progress.
2. **Red Phase**: Write failing tests.
3. **Green Phase**: Implement minimum code to pass tests.
4. **Refactor**: Improve code while keeping tests passing.
5. **Git Notes**: Attach task summary to the commit.
6. **Mark [x]**: Update `plan.md` with commit SHA.

## Commit Guidelines
Use Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`.
Attach summaries via `git notes add -m "<summary>" <hash>`.
