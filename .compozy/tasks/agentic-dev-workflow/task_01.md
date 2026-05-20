---
status: pending
title: "docs(translation): translate all Portuguese content in lm-commons to English"
type: docs
complexity: medium
dependencies: []
---

# Task 01: docs(translation): translate all Portuguese content in lm-commons to English

## Overview
Translate all existing documentation, rules, playbooks, and custom workspace skills in `lm-commons/` from Portuguese to English. This establishes English as the unified, single language of the repository to prevent translation errors, simplify LLM reasoning, and align with global coding standards.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- All custom skills in `ai-commons/skills/` (including `openclaw-expert`, `homelab-architect`, `intellifinance-pipeline`, and `ai-commons-manager`) MUST be translated to English.
- The description in YAML frontmatter and all sections in each `SKILL.md` MUST be translated.
- Any other repository documentation, comments, or scripts containing Portuguese text within `lm-commons/` MUST be translated.
- Original formatting, YAML structures, markdown tags, and technical links MUST be fully preserved during translation.
</requirements>

## Subtasks
- [ ] 01.1 Locate and list all files containing Portuguese content under `lm-commons/`.
- [ ] 01.2 Translate `ai-commons/skills/ai-commons-manager/SKILL.md` to English.
- [ ] 01.3 Translate `ai-commons/skills/openclaw-expert/SKILL.md` to English.
- [ ] 01.4 Translate `ai-commons/skills/homelab-architect/SKILL.md` to English.
- [ ] 01.5 Translate `ai-commons/skills/intellifinance-pipeline/SKILL.md` to English.
- [ ] 01.6 Review and translate other repo markdown files or scripts if any contain Portuguese.

## Implementation Details
Use the agent's translation capabilities to convert Portuguese text to natural, professional English. Do not modify key technical identifiers or code blocks.

### Relevant Files
- `ai-commons/skills/ai-commons-manager/SKILL.md` — Custom skill in Portuguese.
- `ai-commons/skills/openclaw-expert/SKILL.md` — Custom skill in Portuguese.
- `ai-commons/skills/homelab-architect/SKILL.md` — Custom skill in Portuguese.
- `ai-commons/skills/intellifinance-pipeline/SKILL.md` — Custom skill in Portuguese.

### Dependent Files
- `verify-env.sh` — May reference skill folder locations or require validation.

## Deliverables
- Fully translated custom skill files in English.
- Zero Portuguese text in the tracked codebase of `lm-commons/` (except where specifically intended, like test data).

## Tests
- Unit tests:
  - [ ] None.
- Integration tests:
  - [ ] Verify that `bootstrap.sh` and `verify-env.sh` still run and exit 0 after translations.
  - [ ] Inspect the translated skills to confirm no Portuguese text remains and markdown links are valid.

## Success Criteria
- All translated skills are in natural, correct English.
- Verification checks pass.
