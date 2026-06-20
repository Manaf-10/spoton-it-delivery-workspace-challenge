import { DatabaseService } from './database.service';

type SeedWorkItem = {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  assignee: string;
  dueDate: string;
  createdBy: string;
};

type SeedQaCheck = {
  id: string;
  workItemId: string;
  testTitle: string;
  expectedResult: string;
  actualResult: string | null;
  status: string;
  tester: string;
  notes: string | null;
};

type SeedRelease = {
  id: string;
  version: string;
  releaseDate: string;
  summary: string;
  deploymentStatus: string;
  linkedWorkItemIds: string[];
};

const workItems: SeedWorkItem[] = [
  {
    id: 'seed_wi_backlog',
    title: 'Create employee onboarding checklist',
    description: 'Prepare the first version of the onboarding checklist for new IT requests.',
    type: 'feature',
    status: 'backlog',
    priority: 'medium',
    assignee: 'Intern Candidate',
    dueDate: '2026-06-25',
    createdBy: 'seed_user',
  },
  {
    id: 'seed_wi_in_progress',
    title: 'Fix workspace filter behavior',
    description: 'Make sure work item filters stay responsive across desktop and mobile layouts.',
    type: 'bug',
    status: 'in_progress',
    priority: 'high',
    assignee: 'Alex Rivera',
    dueDate: '2026-06-27',
    createdBy: 'seed_user',
  },
  {
    id: 'seed_wi_qa',
    title: 'Validate QA checks flow',
    description: 'Confirm QA checks can be created, updated, and reviewed from the workspace.',
    type: 'maintenance',
    status: 'qa',
    priority: 'urgent',
    assignee: 'Sam Lee',
    dueDate: '2026-06-28',
    createdBy: 'seed_user',
  },
  {
    id: 'seed_wi_ready',
    title: 'Prepare release notes panel',
    description: 'Add the release notes panel and link ready work items to a release.',
    type: 'improvement',
    status: 'ready_for_release',
    priority: 'medium',
    assignee: 'Maya Chen',
    dueDate: '2026-06-30',
    createdBy: 'seed_user',
  },
];

const qaChecks: SeedQaCheck[] = [
  {
    id: 'seed_qa_filter_mobile',
    workItemId: 'seed_wi_in_progress',
    testTitle: 'Filter form stays aligned',
    expectedResult: 'The filter controls fit inside the workspace card without horizontal scroll.',
    actualResult: null,
    status: 'pending',
    tester: 'Intern Candidate',
    notes: 'Run after the next frontend polish pass.',
  },
  {
    id: 'seed_qa_checks_flow',
    workItemId: 'seed_wi_qa',
    testTitle: 'QA status update works',
    expectedResult: 'Changing a QA check status updates the card and keeps the selected work item.',
    actualResult: 'Status changes are saved and the list refreshes.',
    status: 'passed',
    tester: 'Sam Lee',
    notes: 'Ready to verify with backend running.',
  },
  {
    id: 'seed_qa_release_notes',
    workItemId: 'seed_wi_ready',
    testTitle: 'Release notes can be linked',
    expectedResult: 'Ready work items appear in the release form selection list.',
    actualResult: 'Ready work item appears and can be selected.',
    status: 'passed',
    tester: 'Maya Chen',
    notes: 'This item can be used to test release creation.',
  },
];

const releases: SeedRelease[] = [
  {
    id: 'seed_release_100',
    version: 'v1.0.0-seed',
    releaseDate: '2026-07-01',
    summary: 'Seed release for testing the release listing and deploy action.',
    deploymentStatus: 'scheduled',
    linkedWorkItemIds: ['seed_wi_ready'],
  },
];

export const seedDatabase = async (db = new DatabaseService()) => {
  await db.initSchema();

  await db.transaction(async (client) => {
    for (const item of workItems) {
      await client.query(
        `
          insert into work_items
            (id, title, description, type, status, priority, assignee, due_date, created_by)
          values
            ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          on conflict (id) do update
          set
            title = excluded.title,
            description = excluded.description,
            type = excluded.type,
            status = excluded.status,
            priority = excluded.priority,
            assignee = excluded.assignee,
            due_date = excluded.due_date,
            created_by = excluded.created_by,
            updated_at = now()
        `,
        [
          item.id,
          item.title,
          item.description,
          item.type,
          item.status,
          item.priority,
          item.assignee,
          item.dueDate,
          item.createdBy,
        ],
      );
    }

    for (const check of qaChecks) {
      await client.query(
        `
          insert into qa_checks
            (id, work_item_id, test_title, expected_result, actual_result, status, tester, notes)
          values
            ($1, $2, $3, $4, $5, $6, $7, $8)
          on conflict (id) do update
          set
            work_item_id = excluded.work_item_id,
            test_title = excluded.test_title,
            expected_result = excluded.expected_result,
            actual_result = excluded.actual_result,
            status = excluded.status,
            tester = excluded.tester,
            notes = excluded.notes,
            updated_at = now()
        `,
        [
          check.id,
          check.workItemId,
          check.testTitle,
          check.expectedResult,
          check.actualResult,
          check.status,
          check.tester,
          check.notes,
        ],
      );
    }

    for (const release of releases) {
      await client.query(
        `
          insert into releases
            (id, version, release_date, summary, deployment_status)
          values
            ($1, $2, $3, $4, $5)
          on conflict (id) do update
          set
            version = excluded.version,
            release_date = excluded.release_date,
            summary = excluded.summary,
            deployment_status = excluded.deployment_status,
            updated_at = now()
        `,
        [release.id, release.version, release.releaseDate, release.summary, release.deploymentStatus],
      );

      for (const workItemId of release.linkedWorkItemIds) {
        await client.query(
          `
            insert into release_work_items (release_id, work_item_id)
            values ($1, $2)
            on conflict (release_id, work_item_id) do nothing
          `,
          [release.id, workItemId],
        );
      }
    }
  });

  await db.onModuleDestroy();

  return {
    qaChecks: qaChecks.length,
    releases: releases.length,
    workItems: workItems.length,
  };
};

const runSeed = async () => {
  const result = await seedDatabase();

  console.log(
    `Seeded ${result.workItems} work items, ${result.qaChecks} QA checks, and ${result.releases} releases.`,
  );
};

if (require.main === module) {
  runSeed().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
