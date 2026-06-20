const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export type LoginResponse = {
  accessToken: string;
  user: { id: string; name: string; email: string; role: string };
};

export type ScoreSummary = {
  total: number;
  events: Array<{ id: string; action: string; points: number; createdAt: string }>;
};

export type WorkspaceSummary = {
  message: string;
  counts: {
    activeWorkItems: number;
    qaChecks: number;
    readyWorkItems: number;
    releasedWorkItems: number;
    releases: number;
    totalWorkItems: number;
  };
};

export type WorkItemType = 'feature' | 'bug' | 'improvement' | 'maintenance';
export type WorkItemStatus = 'backlog' | 'planned' | 'in_progress' | 'qa' | 'ready_for_release' | 'released';
export type WorkItemPriority = 'low' | 'medium' | 'high' | 'urgent';
export type QaCheckStatus = 'pending' | 'passed' | 'failed';
export type DeploymentStatus = 'draft' | 'scheduled' | 'deployed' | 'rolled_back';

export const WORK_ITEM_TYPES: WorkItemType[] = ['feature', 'bug', 'improvement', 'maintenance'];
export const WORK_ITEM_PRIORITIES: WorkItemPriority[] = ['low', 'medium', 'high', 'urgent'];
export const WORK_ITEM_STATUSES: WorkItemStatus[] = [
  'backlog',
  'planned',
  'in_progress',
  'qa',
  'ready_for_release',
  'released',
];
export const QA_CHECK_STATUSES: QaCheckStatus[] = ['pending', 'passed', 'failed'];
export const DEPLOYMENT_STATUSES: DeploymentStatus[] = ['draft', 'scheduled', 'deployed', 'rolled_back'];

export type WorkItem = {
  id: string;
  title: string;
  description: string;
  type: WorkItemType;
  status: WorkItemStatus;
  priority: WorkItemPriority;
  assignee: string;
  dueDate: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkItemFilters = {
  status?: WorkItemStatus;
  priority?: WorkItemPriority;
  assignee?: string;
  search?: string;
};

export type CreateWorkItemInput = {
  title: string;
  description: string;
  type: WorkItemType;
  priority: WorkItemPriority;
  assignee: string;
  dueDate?: string;
};

export type UpdateWorkItemInput = Partial<CreateWorkItemInput> & {
  status?: WorkItemStatus;
};

export type QaCheck = {
  id: string;
  workItemId: string;
  testTitle: string;
  expectedResult: string;
  actualResult: string | null;
  status: QaCheckStatus;
  tester: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type QaCheckFilters = {
  workItemId?: string;
  status?: QaCheckStatus;
};

export type CreateQaCheckInput = {
  workItemId: string;
  testTitle: string;
  expectedResult: string;
  actualResult?: string;
  status: QaCheckStatus;
  tester: string;
  notes?: string;
};

export type UpdateQaCheckInput = Partial<CreateQaCheckInput>;

export type Release = {
  id: string;
  version: string;
  releaseDate: string;
  summary: string;
  deploymentStatus: DeploymentStatus;
  linkedWorkItemIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateReleaseInput = {
  version: string;
  releaseDate: string;
  summary: string;
  deploymentStatus: DeploymentStatus;
  linkedWorkItemIds?: string[];
};

export type UpdateReleaseInput = Partial<CreateReleaseInput>;

const withQuery = (path: string, query: object) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (typeof value === 'string' && value) params.set(key, value);
  });

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
};

export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('spoton_challenge_token');
};

export const saveToken = (token: string) => {
  window.localStorage.setItem('spoton_challenge_token', token);
};

export const clearToken = () => {
  window.localStorage.removeItem('spoton_challenge_token');
};

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const token = getToken();
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(getErrorMessage(data));
  }

  return data as T;
};

const getErrorMessage = (data: unknown) => {
  if (typeof data === 'string') return data;

  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message?: unknown }).message;

    if (Array.isArray(message)) return message.join('. ');
    if (typeof message === 'string') return message;
  }

  if (data && typeof data === 'object' && 'error' in data) {
    const error = (data as { error?: unknown }).error;

    if (typeof error === 'string') return error;
  }

  return 'Request failed';
};

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<LoginResponse['user']>('/auth/me'),
  score: () => request<ScoreSummary>('/score/me'),
  workspaceSummary: () => request<WorkspaceSummary>('/it-workspace/summary'),
  listWorkItems: (filters: WorkItemFilters = {}) => request<WorkItem[]>(withQuery('/work-items', filters)),
  getWorkItem: (id: string) => request<WorkItem>(`/work-items/${id}`),
  createWorkItem: (body: CreateWorkItemInput) =>
    request<WorkItem>('/work-items', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateWorkItem: (id: string, body: UpdateWorkItemInput) =>
    request<WorkItem>(`/work-items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  deleteWorkItem: (id: string) =>
    request<{ ok: true }>(`/work-items/${id}`, {
      method: 'DELETE',
    }),
  listQaChecks: (filters: QaCheckFilters = {}) => request<QaCheck[]>(withQuery('/qa-checks', filters)),
  getQaCheck: (id: string) => request<QaCheck>(`/qa-checks/${id}`),
  createQaCheck: (body: CreateQaCheckInput) =>
    request<QaCheck>('/qa-checks', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateQaCheck: (id: string, body: UpdateQaCheckInput) =>
    request<QaCheck>(`/qa-checks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  deleteQaCheck: (id: string) =>
    request<{ ok: true }>(`/qa-checks/${id}`, {
      method: 'DELETE',
    }),
  listReleases: () => request<Release[]>('/releases'),
  getRelease: (id: string) => request<Release>(`/releases/${id}`),
  createRelease: (body: CreateReleaseInput) =>
    request<Release>('/releases', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateRelease: (id: string, body: UpdateReleaseInput) =>
    request<Release>(`/releases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  deployRelease: (id: string) =>
    request<Release>(`/releases/${id}/deploy`, {
      method: 'POST',
    }),
  deleteRelease: (id: string) =>
    request<{ ok: true }>(`/releases/${id}`, {
      method: 'DELETE',
    }),
};
