---
status: pending
title: "test(linear): create test suite for sync-compozy-tasks.py"
type: test
complexity: medium
dependencies:
  - task_03
---

# Task 04: test(linear): create test suite for sync-compozy-tasks.py

## Overview
Implement a comprehensive unit and integration test suite for the `sync-compozy-tasks.py` script. The suite will validate YAML frontmatter parsing, updating without markdown corruption, and API client behavior using mocks to ensure safety and prevent regression.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- A test suite MUST be created under `ai-commons/scripts/tests/test_sync_compozy_tasks.py` (or similar python testing structure).
- The tests MUST validate YAML frontmatter parsing of valid and invalid files.
- The tests MUST validate that writing the `linear_issue_id` back preserves the original markdown body and other frontmatter fields exactly.
- The tests MUST mock all Linear GraphQL API network requests to allow tests to run offline.
- Test coverage for the synchronization script MUST reach at least 80%.
</requirements>

## Subtasks
- [ ] 04.1 Create python test file under `ai-commons/scripts/tests/`.
- [ ] 04.2 Write unit tests for frontmatter parsing and serialization.
- [ ] 04.3 Write unit tests for the Linear API payload generation and mock network layer.
- [ ] 04.4 Run test suite and measure test coverage to reach >=80%.

## Implementation Details
Use Python's native `unittest` module or `pytest` to write unit and mock tests.

### Relevant Files
- `ai-commons/scripts/tests/test_sync_compozy_tasks.py` [NEW] — Test suite.
- `ai-commons/scripts/sync-compozy-tasks.py` — Target of testing.

### Dependent Files
- None.

## Deliverables
- Test suite file `test_sync_compozy_tasks.py`.
- Test coverage report showing >=80% coverage.

## Tests
- Unit tests:
  - [ ] Execute `python3 -m unittest discover -s ai-commons/scripts/tests` and confirm all tests pass.

## Success Criteria
- Test coverage target >=80% achieved.
- All unit tests pass cleanly.
