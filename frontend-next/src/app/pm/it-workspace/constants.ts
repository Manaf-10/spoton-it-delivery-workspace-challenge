import type { CreateQaCheckInput, CreateWorkItemInput, WorkItemStatus } from '@/lib/api';

export const NEXT_STATUSES: Record<WorkItemStatus, WorkItemStatus[]> = {
  backlog: ['planned'],
  planned: ['in_progress'],
  in_progress: ['qa'],
  qa: ['in_progress', 'ready_for_release'],
  ready_for_release: ['qa', 'released'],
  released: [],
};

export const INITIAL_WORK_ITEM_FORM: CreateWorkItemInput = {
  title: '',
  description: '',
  type: 'feature',
  priority: 'medium',
  assignee: '',
  dueDate: '',
};

export const INITIAL_QA_FORM: CreateQaCheckInput = {
  workItemId: '',
  testTitle: '',
  expectedResult: '',
  actualResult: '',
  status: 'pending',
  tester: '',
  notes: '',
};

export const today = new Date().toISOString().slice(0, 10);

export const formatLabel = (value: string) => value.replaceAll('_', ' ');
