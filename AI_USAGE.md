# AI Usage

## Tools Used

| Tool | Used? | Notes |
| --- | --- | --- |
| ChatGPT | No | Not used directly. |
| Claude | No | Not used. |
| Codex | Yes | Used for code generation, refactoring, debugging, and documentation. |
| Cursor | No | Not used. |
| Other | No | Not used. |

## Summary

I used Codex to help move faster through the full-stack work. Codex helped inspect the project, create backend modules, write frontend components, add database helpers, and update documentation.

I reviewed the code manually after each major change. Some AI output was accepted, some was changed, and some was removed.

## Main Areas AI Helped With

- Architecture: helped split the workspace into Work Items, QA Checks, and Releases.
- Backend: helped create controllers, services, DTOs, workflow rules, and PostgreSQL queries.
- Frontend: helped build forms, filters, workspace views, validation, and error feedback.
- Database: helped create the schema, database helper, startup schema init, and seed command.
- Tests: suggested Jest service tests, but I removed them because I did not want that approach.
- Debugging: helped find missing validation, layout issues, and PostgreSQL setup issues.
- Documentation: helped write `PROMPT_LOG.md`, `DECISIONS.md`, and this file.

## What I Reviewed Manually

I reviewed:

- database table structure
- API route behavior
- DTO validation rules
- status transition rules
- QA readiness rule
- release deployment behavior
- frontend form behavior
- mobile and desktop layout
- prompt log wording and commit hashes

I also tested the app manually while building the workspace.

## What AI Got Wrong

Codex added some work before I wanted it, especially frontend API helpers. I reviewed it and decided to keep it.

## Commands Run

Important commands used during the work:

```bash
npm run install:all
docker compose up -d postgres
npm run dev:api
npm run dev:web
npm run dev:seed
```
## Known Limitations

- Score integration is not complete.
- There is no dedicated My Work page, only assignee filtering.
- Releases have create/list/deploy, but no full detail page.
- Backend tests are not included.
- Frontend lint still needs cleanup around the old workspace loader pattern.

## Prompt Log

The prompt log is in `PROMPT_LOG.md`.
