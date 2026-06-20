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

- f91d139 - added empty database service to the backend
- b75b408 - added the full schema script
- 8543a36 - created the initialize schema function on startup and added it in the server

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

- f57d954 - created work items update method and response DTO

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

- d58d7c9 - replaced all old functions with arrow function and APIs are done

## 2026-06-20 - Codex

### Goal

Create the Work Items listing and form with search filters.

### Prompt

Create the form for creating the work item with the appropriate fields. Make sure that the due date cannot be less than today. Add the search bar with the filters and below it the listing. Use a grid box to make them use a pento-box-like layout with respect to the mobile view.

### Output Summary

Codex built the Work Items frontend page with a create form, search and filter controls, loading/empty/error/success states, and a grid-based work item listing. It also added frontend styling for the workspace layout and blocked past dates in the due date picker.

### Files Changed

- frontend-next/src/app/pm/it-workspace/page.tsx
- frontend-next/src/app/globals.css
- frontend-next/src/lib/api.ts

### Manual Review

Reviewed the page in the browser, adjusted the desktop layout after it broke at larger widths, changed the listing from table layout to CSS grid, normalized the form controls, and accepted the final layout direction.

### Related Commit

- 11c95bd - work items form and listing implemented

## 2026-06-20 - Codex

### Goal

Add the QA checks to the workspace and make the actions switch the lower view.

### Prompt

Now add the QA checks. It is getting too cramped up, make the actions have buttons where when you press a button it switches the lower part into that action which we have work items, QA checks, and maybe other things.

### Output Summary

Codex added the QA checks view to the IT Workspace. It added action buttons that switch the lower section between Work Items and QA Checks, added the QA work item picker, QA summary, QA form, QA list, and QA status updates.

### Files Changed

- frontend-next/src/app/pm/it-workspace/page.tsx
- frontend-next/src/app/globals.css
- frontend-next/src/lib/api.ts

### Manual Review

Reviewed the UI after the QA checks were added and adjusted the layout because the workspace was getting too crowded. Accepted the action-button approach because it made the page easier to use before adding more modules.

### Related Commit

- c68c095 - refactored the page.tsx into smaller parts

## 2026-06-20 - Codex

### Goal

Refactor the IT Workspace page into smaller components.

### Prompt

The page.tsx is too big now, refactor it make smaller components.

### Output Summary

Codex split the large IT Workspace page into smaller route-level components. The main page now keeps the state and handlers, while the summary, actions, work items view, and QA checks view live in separate component files. Shared constants and types were moved out too.

### Files Changed

- frontend-next/src/app/pm/it-workspace/page.tsx
- frontend-next/src/app/pm/it-workspace/components/WorkspaceSummary.tsx
- frontend-next/src/app/pm/it-workspace/components/WorkspaceActions.tsx
- frontend-next/src/app/pm/it-workspace/components/WorkItemsView.tsx
- frontend-next/src/app/pm/it-workspace/components/QaChecksView.tsx
- frontend-next/src/app/pm/it-workspace/constants.ts
- frontend-next/src/app/pm/it-workspace/types.ts

### Manual Review

Reviewed the refactor to confirm the page became smaller and the behavior stayed the same.

### Related Commit

- c68c095 - refactored the page.tsx into smaller parts

## 2026-06-20 - Codex

### Goal

Add the Releases view to the IT Workspace actions.

### Prompt

The releases view should be added with the actions in the IT workspace. Add the form with the listing of the releases.

### Output Summary

Codex added Releases as another workspace action beside Work Items and QA Checks. The new view includes a create release form, ready work item selection, release listing, and deploy action.

### Files Changed

- frontend-next/src/app/pm/it-workspace/page.tsx
- frontend-next/src/app/pm/it-workspace/components/WorkspaceActions.tsx
- frontend-next/src/app/pm/it-workspace/components/ReleasesView.tsx
- frontend-next/src/app/pm/it-workspace/constants.ts
- frontend-next/src/app/pm/it-workspace/types.ts
- frontend-next/src/lib/api.ts
- frontend-next/src/app/globals.css

### Manual Review

Reviewed the Releases view after it was added to the workspace actions and accepted the form/listing direction.

### Related Commit

- d9455c2 - created the releases view

## 2026-06-20 - Codex

### Goal

Add data seeding for local development.

### Prompt

Add data seeding with the function and the command, with the command being npm run dev:seed.

### Output Summary

Codex added a reusable seed function for PostgreSQL data and wired a root-level `npm run dev:seed` command. The seed creates sample work items, QA checks, and a release using upserts so it can be run more than once.

### Files Changed

- backend-nest/src/database/seed.ts
- backend-nest/package.json
- package.json

### Manual Review

Ran the seed command and confirmed it seeded 4 work items, 3 QA checks, and 1 release.

### Related Commit

- 6e95864 - added data seeding
