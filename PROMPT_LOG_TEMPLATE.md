# Prompt Log

Use this file to record meaningful AI-assisted work. You do not need to log tiny autocomplete suggestions. Log prompts that shaped architecture, code, debugging, tests, or product decisions.

## Entry Template

```md
## YYYY-MM-DD HH:mm - Tool Name

### Goal
What were you trying to accomplish?

### Prompt
Paste the exact prompt, or a faithful summary if the prompt included private context.

### Output Summary
What did the AI suggest or generate?

### Files Changed
- path/to/file.ts
- path/to/component.tsx

### Manual Review
What did you verify, change, reject, or test yourself?

### Related Commit
commit-hash-if-available
```

## Entries

## 2026-06-18 : 01:00- Codex

### Goal

design the first version of the database schema.

### Prompt

read the README and the project and generate an approprite sql schema

### Output Summary

he gave me the schema script with the database service class.

### Files Changed

- backend-nest/src/database/schema.sql
- backend-nest/src/database/database.service.ts

### Manual Review

Since the ERD was simple enough making the AI read the relitaly small project and generating the ERD and the database service class then reviewing  them were faster and more convenient, (i did review the script and everything they were simple enough and working as expected)

### Related Commit

N/A
