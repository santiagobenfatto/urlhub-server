# General Instructions

These rules apply to every task.

## Scope

- Modify only what is explicitly requested.
- Do not modify files unrelated to the requested task.
- Do not refactor unrelated code.
- Do not redesign the architecture.
- Keep changes as small as possible.

## Architecture

- Respect the current project architecture.
- Preserve existing API contracts unless explicitly requested.
- Do not introduce new abstractions without clear justification.
- Do not add dependencies unless explicitly requested.

## Code Style

- Follow the existing code style.
- Keep naming conventions consistent.
- Prefer readability over clever code.
- Reuse existing utilities whenever possible.
- Keep implementations simple and explicit.

## Backend / Frontend

- Do not invent temporary workarounds.
- If backend work is required, clearly state the required API contract.
- If frontend work is required, clearly state the required changes.
- Do not modify adapters unless the API contract changes.

## Planning

- When requested in PLAN mode, do not edit code.
- Explain the implementation before modifying files.
- Mention every file that will be changed.
- State any assumptions instead of silently making architectural decisions.

## Uncertainty

- Never assume missing requirements.
- If something is unclear, ask or explicitly state the assumption before implementing.
- Do not infer new features or behaviors that were not requested.

## Final Output

Always include:

- Files modified.
- Brief explanation.
- Any backend dependency.
- Any frontend dependency.