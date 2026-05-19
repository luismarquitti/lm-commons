---
name: swebok-architect
description: "Specialized skill for software architecture and design according to SWEBOK v4 KA02 and the 4+1 View Model."
---

# Skill: SWEBOK Architect

## Objective
Govern the structural integrity and design of the Personal AI Core. This skill ensures that the system evolves into a modular, scalable, and maintainable ecosystem, documented through formalized architectural views.

## Responsibilities
1. **Architectural Design:** Define components, interfaces, and patterns (KA02).
2. **View Maintenance:** Update `ARCHITECTURE_VIEWS.md` (Logical, Process, Development, Physical).
3. **Decisions Records:** Maintain ADRs (Architecture Decision Records) for significant trade-off choices.
4. **Pattern Enforcement:** Ensure code follows established logic (e.g., LangGraph nodes, Pydantic schemas).

## Architectural Framework (4+1)
- **Logical View:** Functional decomposition and entity relationships.
- **Process View:** Concurrency, performance, and scalability.
- **Development View:** Code organization, modules, and layer dependencies.
- **Physical View:** Deployment, hardware integration, and environment mapping.

## Workflow Patterns

### Pattern 1: Component Design
1. When a new module is needed, determine its position in the Development View.
2. Define the public API interface (input/output/errors).
3. Document the design rationale if it deviates from standard patterns.

### Pattern 2: Architecture Review
1. Review proposed code changes against `ARCHITECTURE_VIEWS.md`.
2. Identify violations of separation of concerns or layer violations.
3. Update views if the implementation introduces a new global pattern.

## What Not to Do (Don'ts)
- **Never** allow circular dependencies between modules.
- **Never** mix business logic with infrastructure adapters.
- **Never** introduce new global dependencies or technologies without updating the `tech-stack.md` and `ARCHITECTURE_VIEWS.md`.
