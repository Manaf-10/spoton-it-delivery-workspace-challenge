# Technical Decisions

## Summary

I built the main IT Delivery Workspace flow:

- Work Items
- QA Checks
- Releases
- PostgreSQL persistence
- backend workflow rules
- frontend forms, filters, validation, and workspace views
- seed data command

The core flow is:

```txt
work item -> QA checks -> ready for release -> release -> deploy
```

## Database Design

I used PostgreSQL with four main tables:

- `work_items`
- `qa_checks`
- `releases`
- `release_work_items`

`qa_checks` belongs to a work item.

`release_work_items` links releases to work items because one release can include many work items.

The schema uses checks for allowed values like work item status, priority, QA status, and deployment status.

## API Design

The backend uses separate NestJS modules/controllers for the main areas:

- `/work-items`
- `/qa-checks`
- `/releases`
- `/it-workspace/summary`

I kept the main business rules in services, not in the frontend. The frontend guides the user, but the backend still protects the data.

## Frontend Design

The IT Workspace page has a summary at the top, then action buttons to switch between:

- Work Items
- QA Checks
- Releases

This keeps the page from getting too crowded.

The large page was split into smaller components:

- `WorkspaceSummary`
- `WorkspaceActions`
- `WorkItemsView`
- `QaChecksView`
- `ReleasesView`
- `WorkspaceFeedback`

I used native form validation where possible because it is fast, clear, and shows feedback directly to the user.

## Workflow Rules

Work item status transitions are controlled in the backend.

Allowed flow:

```txt
backlog -> planned -> in_progress -> qa -> ready_for_release -> released
```

Allowed backwards movement:

```txt
qa -> in_progress
ready_for_release -> qa
```

A work item cannot move to `ready_for_release` unless it has QA checks and all of them are passed.

Only `ready_for_release` work items can be linked to a release.

When a release is deployed, linked work items move to `released`.

Score idempotency was not implemented.

## Tradeoffs

I did not use an ORM. The project uses raw `pg` queries because it was faster for this challenge and kept the database behavior easy to see.

I kept releases in the workspace instead of creating a separate detail page. This made the full flow faster to complete.

I used simple native frontend validation instead of building a custom validation system.

I removed the backend Jest tests because I decided not to keep that testing approach in the project.

## Unfinished Work

With more time, I would add:

- Use Prisma ORM instead of raw SQL queries.
- Refactor `page.tsx` instead of using many `useState` calls. I would use `useReducer` to make the component less complex and cleaner.
- Build a more intuitive UI/UX for user validation. Instead of default input validation, I would use custom validation messages and states.
- Add a users table so tasks can be assigned to real users, and each user can see their own work in their profile.
- Integrate BullMQ so scheduled background jobs can run for tasks with specific due dates, such as notifying the assigned user.
- Add a dark theme.
- Let users customize the IT Workspace layout.
- Use Jest to create a complete and thorough backend test suite.
- Use Bootstrap components for both desktop and mobile views to make the dashboard cleaner and more consistent.
- Add score integration for workflow actions.
- Add a dedicated My Work view.
- Add a release detail page.
