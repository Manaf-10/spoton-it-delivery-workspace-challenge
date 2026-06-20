# Prompt Log

Use this file to record meaningful AI-assisted work. You do not need to log tiny autocomplete suggestions. Log prompts that shaped architecture, code, debugging, tests, or product decisions.

## Entries

## 2026-06-18 01:00 - Codex

### Goal

Design the first version of the database schema.

### Prompt

Read the README and the project and generate an appropriate SQL schema.

### Output Summary

Codex generated the initial PostgreSQL schema script and database service class.

### Files Changed

- backend-nest/src/database/schema.sql
- backend-nest/src/database/database.service.ts

### Manual Review

The ERD was simple enough that having AI inspect the small project and generate the initial schema/database helper was faster. I reviewed the generated SQL and service class manually and confirmed the structure matched the challenge requirements.

### Related Commit

N/A

## 2026-06-20 - Codex

### Goal

Finish the backend Work Items module so it supports real PostgreSQL-backed CRUD behavior, filtering, response mapping, registration in NestJS, and workflow validation.

### Prompt

Create the Update Work Items method. Use it by making valid transitions. You can see the valid transitions in the README file. Make it so the current status is the key and the valid transitions are the values, then check and use them when it is time to validate.

### Output Summary

Codex completed the Work Items backend implementation. It added a response DTO, registered the controller and service in the Nest module, added filters for status, priority, assignee, and text search, implemented update/delete behavior, and enforced workflow transition rules. It also added the QA readiness rule: a work item cannot move to `ready_for_release` unless it has at least one QA check and all QA checks are passed.

### Files Changed

- backend-nest/src/app.module.ts
- backend-nest/src/work_items/work_items.controller.ts
- backend-nest/src/work_items/work_items.service.ts
- backend-nest/src/work_items/dto/work-item-response.dto.ts

### Manual Review

Reviewed the generated service/controller changes to confirm the API routes are registered and the workflow transitions match the challenge brief.

### Related Commit

N/A

## 2026-06-20 - Codex

### Goal

Change old function declarations to the new arrow function style, then start putting the APIs in the frontend.

### Prompt

Replace the old function declarations with arrow functions for consistency, then start adding the frontend API helpers needed to call the backend endpoints.

### Output Summary

Codex changed the normal function declarations to arrow functions where it was safe. It also added the frontend API helpers for Work Items, QA Checks, and Releases so the frontend can call the new backend routes.

### Files Changed

- frontend-next/src/lib/api.ts
- frontend-next/src/app/layout.tsx
- frontend-next/src/app/page.tsx
- frontend-next/src/app/login/page.tsx
- frontend-next/src/app/pm/layout.tsx
- frontend-next/src/app/pm/page.tsx
- frontend-next/src/app/pm/score/page.tsx
- frontend-next/src/app/pm/it-workspace/page.tsx
- backend-nest/src/main.ts

### Manual Review

Codex decided to add the missing frontend APIs by itself, which was not the original plan because I wanted to do that part myself. After reviewing the generated API helpers and validating that they matched the backend routes and DTO shapes, I decided to accept the work.

### Related Commit

N/A
