import type { WorkItemPriority, WorkItemStatus } from '@/lib/api';

export type WorkspaceView = 'work-items' | 'qa-checks';

export type WorkItemFiltersState = {
  status: '' | WorkItemStatus;
  priority: '' | WorkItemPriority;
  assignee: string;
  search: string;
};
