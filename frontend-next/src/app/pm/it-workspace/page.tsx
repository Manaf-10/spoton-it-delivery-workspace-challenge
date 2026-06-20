'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  api,
  CreateQaCheckInput,
  CreateWorkItemInput,
  QaCheck,
  QA_CHECK_STATUSES,
  QaCheckStatus,
  WorkItem,
  WORK_ITEM_PRIORITIES,
  WORK_ITEM_STATUSES,
  WORK_ITEM_TYPES,
  WorkItemPriority,
  WorkItemStatus,
  WorkItemType,
} from '@/lib/api';

const NEXT_STATUSES: Record<WorkItemStatus, WorkItemStatus[]> = {
  backlog: ['planned'],
  planned: ['in_progress'],
  in_progress: ['qa'],
  qa: ['in_progress', 'ready_for_release'],
  ready_for_release: ['qa', 'released'],
  released: [],
};

const INITIAL_FORM: CreateWorkItemInput = {
  title: '',
  description: '',
  type: 'feature',
  priority: 'medium',
  assignee: '',
  dueDate: '',
};

const INITIAL_QA_FORM: CreateQaCheckInput = {
  workItemId: '',
  testTitle: '',
  expectedResult: '',
  actualResult: '',
  status: 'pending',
  tester: '',
  notes: '',
};

const today = new Date().toISOString().slice(0, 10);

const formatLabel = (value: string) => value.replaceAll('_', ' ');

const ItWorkspacePage = () => {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [form, setForm] = useState<CreateWorkItemInput>(INITIAL_FORM);
  const [selectedWorkItemId, setSelectedWorkItemId] = useState('');
  const [qaChecks, setQaChecks] = useState<QaCheck[]>([]);
  const [qaLoading, setQaLoading] = useState(false);
  const [qaSaving, setQaSaving] = useState(false);
  const [qaForm, setQaForm] = useState<CreateQaCheckInput>(INITIAL_QA_FORM);
  const [filters, setFilters] = useState<{
    status: '' | WorkItemStatus;
    priority: '' | WorkItemPriority;
    assignee: string;
    search: string;
  }>({
    status: '',
    priority: '',
    assignee: '',
    search: '',
  });

  const filteredAssignees = useMemo(() => {
    return Array.from(new Set(workItems.map((item) => item.assignee).filter(Boolean))).sort();
  }, [workItems]);

  const summary = useMemo(() => {
    return {
      total: workItems.length,
      active: workItems.filter((item) => !['ready_for_release', 'released'].includes(item.status)).length,
      ready: workItems.filter((item) => item.status === 'ready_for_release').length,
      released: workItems.filter((item) => item.status === 'released').length,
    };
  }, [workItems]);

  const selectedWorkItem = useMemo(() => {
    return workItems.find((item) => item.id === selectedWorkItemId) ?? null;
  }, [selectedWorkItemId, workItems]);

  const qaSummary = useMemo(() => {
    const passed = qaChecks.filter((check) => check.status === 'passed').length;
    const failed = qaChecks.filter((check) => check.status === 'failed').length;

    return {
      total: qaChecks.length,
      passed,
      failed,
      pending: qaChecks.length - passed - failed,
    };
  }, [qaChecks]);

  const loadWorkItems = async () => {
    setLoading(true);
    setError('');

    try {
      const items = await api.listWorkItems({
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        assignee: filters.assignee || undefined,
        search: filters.search || undefined,
      });
      setWorkItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load work items');
    } finally {
      setLoading(false);
    }
  };

  const loadQaChecks = async (workItemId = selectedWorkItemId) => {
    if (!workItemId) {
      setQaChecks([]);
      return;
    }

    setQaLoading(true);
    setError('');

    try {
      const checks = await api.listQaChecks({ workItemId });
      setQaChecks(checks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load QA checks');
    } finally {
      setQaLoading(false);
    }
  };

  useEffect(() => {
    void loadWorkItems();
  }, [filters.status, filters.priority, filters.assignee]);

  useEffect(() => {
    api.me()
      .then((user) => {
        setCurrentUserName(user.name);
        setForm((currentForm) => ({
          ...currentForm,
          assignee: currentForm.assignee || user.name,
        }));
        setQaForm((currentForm) => ({
          ...currentForm,
          tester: currentForm.tester || user.name,
        }));
      })
      .catch(() => {
        setCurrentUserName('');
      });
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.createWorkItem({
        ...form,
        dueDate: form.dueDate || undefined,
      });
      setForm({ ...INITIAL_FORM, assignee: currentUserName });
      setSuccess('Work item created.');
      await loadWorkItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create work item');
    } finally {
      setSaving(false);
    }
  };

  const selectWorkItemForQa = async (workItem: WorkItem) => {
    setSelectedWorkItemId(workItem.id);
    setQaForm((currentForm) => ({
      ...currentForm,
      workItemId: workItem.id,
      tester: currentForm.tester || currentUserName,
    }));
    await loadQaChecks(workItem.id);
  };

  const submitQaCheck = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedWorkItem) {
      setError('Select a work item before adding QA checks');
      return;
    }

    setQaSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.createQaCheck({
        ...qaForm,
        workItemId: selectedWorkItem.id,
        actualResult: qaForm.actualResult || undefined,
        notes: qaForm.notes || undefined,
      });
      setQaForm({
        ...INITIAL_QA_FORM,
        workItemId: selectedWorkItem.id,
        tester: currentUserName,
      });
      setSuccess(`QA check added for "${selectedWorkItem.title}".`);
      await loadQaChecks(selectedWorkItem.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create QA check');
    } finally {
      setQaSaving(false);
    }
  };

  const updateQaStatus = async (qaCheck: QaCheck, status: QaCheckStatus) => {
    setError('');
    setSuccess('');

    try {
      await api.updateQaCheck(qaCheck.id, { status });
      setSuccess(`Updated QA check to ${formatLabel(status)}.`);
      await loadQaChecks(qaCheck.workItemId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update QA check');
    }
  };

  const updateStatus = async (workItem: WorkItem, status: WorkItemStatus) => {
    setError('');
    setSuccess('');

    try {
      await api.updateWorkItem(workItem.id, { status });
      setSuccess(`Moved "${workItem.title}" to ${formatLabel(status)}.`);
      await loadWorkItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update work item status');
    }
  };

  const removeWorkItem = async (workItem: WorkItem) => {
    setError('');
    setSuccess('');

    try {
      await api.deleteWorkItem(workItem.id);
      setSuccess(`Deleted "${workItem.title}".`);
      await loadWorkItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete work item');
    }
  };

  return (
    <section aria-label="IT Delivery Workspace">
      <div className="page-header">
        <div>
          <div className="eyebrow">IT Delivery Workspace</div>
          <h1>Work items</h1>
          <p>Plan, assign, and move engineering work through the delivery workflow.</p>
        </div>
      </div>

      {error ? <div className="card error workspace-alert">{error}</div> : null}
      {success ? <div className="card success workspace-alert">{success}</div> : null}

      <div className="workspace-summary">
        <div className="card summary-card">
          <span>Total work</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="card summary-card">
          <span>Active</span>
          <strong>{summary.active}</strong>
        </div>
        <div className="card summary-card">
          <span>Ready for release</span>
          <strong>{summary.ready}</strong>
        </div>
        <div className="card summary-card">
          <span>Released</span>
          <strong>{summary.released}</strong>
        </div>
      </div>

      <div className="card workspace-actions">
        <div>
          <h2>Actions</h2>
          <p>Create work, filter the list, move items through the workflow, or remove items that are no longer needed.</p>
        </div>
        <div className="actions-list">
          <button className="button secondary" onClick={loadWorkItems} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh work'}
          </button>
          <a className="button" href="#create-work-item">
            Create work item
          </a>
        </div>
      </div>

      <div className="workspace-layout">
        <form id="create-work-item" className="card workspace-form" onSubmit={submit}>
          <h2>Create work item</h2>
          <div className="field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Add release readiness checks"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="What needs to be built, fixed, or verified?"
              required
            />
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                value={form.type}
                onChange={(event) => setForm({ ...form, type: event.target.value as WorkItemType })}
              >
                {WORK_ITEM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {formatLabel(type)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={form.priority}
                onChange={(event) => setForm({ ...form, priority: event.target.value as WorkItemPriority })}
              >
                {WORK_ITEM_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {formatLabel(priority)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="assignee">Assignee</label>
              <input
                id="assignee"
                value={form.assignee}
                onChange={(event) => setForm({ ...form, assignee: event.target.value })}
                placeholder="Owner name"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="due-date">Due date</label>
              <input
                id="due-date"
                type="date"
                min={today}
                value={form.dueDate ?? ''}
                onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
              />
            </div>
          </div>
          <button className="button" disabled={saving}>
            {saving ? 'Creating...' : 'Create work item'}
          </button>
        </form>

        <div className="workspace-main">
          <div className="card filters-card">
            <div className="field">
              <label htmlFor="search">Search</label>
              <input
                id="search"
                value={filters.search}
                onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                placeholder="Title or description"
              />
            </div>
            <div className="field">
              <label htmlFor="status-filter">Status</label>
              <select
                id="status-filter"
                value={filters.status}
                onChange={(event) => setFilters({ ...filters, status: event.target.value as '' | WorkItemStatus })}
              >
                <option value="">All statuses</option>
                {WORK_ITEM_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {formatLabel(status)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="priority-filter">Priority</label>
              <select
                id="priority-filter"
                value={filters.priority}
                onChange={(event) => setFilters({ ...filters, priority: event.target.value as '' | WorkItemPriority })}
              >
                <option value="">All priorities</option>
                {WORK_ITEM_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {formatLabel(priority)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="assignee-filter">Assignee</label>
              <input
                id="assignee-filter"
                list="assignees"
                value={filters.assignee}
                onChange={(event) => setFilters({ ...filters, assignee: event.target.value })}
                placeholder="Anyone"
              />
              <datalist id="assignees">
                {filteredAssignees.map((assignee) => (
                  <option key={assignee} value={assignee} />
                ))}
              </datalist>
            </div>
            <button className="button secondary" onClick={loadWorkItems} disabled={loading}>
              Apply search
            </button>
          </div>

          <div className="card">
            <div className="section-heading">
              <div>
                <h2>Current work</h2>
                <p>{workItems.length} item{workItems.length === 1 ? '' : 's'} loaded</p>
              </div>
            </div>

            {loading ? <div className="empty table-state">Loading work items...</div> : null}

            {!loading && !workItems.length ? (
              <div className="empty table-state">No work items match the current filters.</div>
            ) : null}

            {!loading && workItems.length ? (
              <div className="work-items-grid" role="table" aria-label="Work items">
                <div className="work-item-row work-item-header" role="row">
                  <div role="columnheader">Item</div>
                  <div role="columnheader">Status</div>
                  <div role="columnheader">Priority</div>
                  <div role="columnheader">Assignee</div>
                  <div role="columnheader">Due</div>
                  <div role="columnheader">Move</div>
                  <div role="columnheader">Actions</div>
                </div>

                {workItems.map((item) => (
                  <div className="work-item-row" role="row" key={item.id}>
                    <div className="work-item-summary" role="cell">
                      <strong>{item.title}</strong>
                      <span>{item.description}</span>
                      <small>{formatLabel(item.type)}</small>
                    </div>
                    <div role="cell">
                      <span className={`badge status-${item.status}`}>{formatLabel(item.status)}</span>
                    </div>
                    <div role="cell">{formatLabel(item.priority)}</div>
                    <div role="cell">{item.assignee}</div>
                    <div role="cell">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'No date'}</div>
                    <div role="cell">
                      <select
                        value=""
                        disabled={!NEXT_STATUSES[item.status].length}
                        onChange={(event) => {
                          if (event.target.value) {
                            void updateStatus(item, event.target.value as WorkItemStatus);
                          }
                        }}
                      >
                        <option value="">Next step</option>
                        {NEXT_STATUSES[item.status].map((status) => (
                          <option key={status} value={status}>
                            {formatLabel(status)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="row-actions" role="cell">
                      <button className="text-button" onClick={() => void selectWorkItemForQa(item)}>
                        QA
                      </button>
                      <button className="text-button" onClick={() => void removeWorkItem(item)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div id="qa-checks" className="qa-section">
        <div className="card qa-panel">
          <div className="section-heading">
            <div>
              <h2>QA checks</h2>
              <p>
                {selectedWorkItem
                  ? `Testing progress for "${selectedWorkItem.title}"`
                  : 'Select a work item from the list to manage its QA checks.'}
              </p>
            </div>
            {selectedWorkItem ? (
              <button className="button secondary" onClick={() => void loadQaChecks()} disabled={qaLoading}>
                {qaLoading ? 'Refreshing...' : 'Refresh QA'}
              </button>
            ) : null}
          </div>

          {selectedWorkItem ? (
            <div className="qa-summary">
              <div>
                <span>Total</span>
                <strong>{qaSummary.total}</strong>
              </div>
              <div>
                <span>Passed</span>
                <strong>{qaSummary.passed}</strong>
              </div>
              <div>
                <span>Pending</span>
                <strong>{qaSummary.pending}</strong>
              </div>
              <div>
                <span>Failed</span>
                <strong>{qaSummary.failed}</strong>
              </div>
            </div>
          ) : null}

          {selectedWorkItem ? (
            <div className="qa-layout">
              <form className="qa-form" onSubmit={submitQaCheck}>
                <div className="field">
                  <label htmlFor="qa-title">Test title</label>
                  <input
                    id="qa-title"
                    value={qaForm.testTitle}
                    onChange={(event) => setQaForm({ ...qaForm, testTitle: event.target.value })}
                    placeholder="Verify happy path"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="qa-expected">Expected result</label>
                  <textarea
                    id="qa-expected"
                    value={qaForm.expectedResult}
                    onChange={(event) => setQaForm({ ...qaForm, expectedResult: event.target.value })}
                    placeholder="What should happen?"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="qa-actual">Actual result</label>
                  <textarea
                    id="qa-actual"
                    value={qaForm.actualResult ?? ''}
                    onChange={(event) => setQaForm({ ...qaForm, actualResult: event.target.value })}
                    placeholder="What happened during testing?"
                  />
                </div>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="qa-status">Status</label>
                    <select
                      id="qa-status"
                      value={qaForm.status}
                      onChange={(event) => setQaForm({ ...qaForm, status: event.target.value as QaCheckStatus })}
                    >
                      {QA_CHECK_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {formatLabel(status)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="qa-tester">Tester</label>
                    <input
                      id="qa-tester"
                      value={qaForm.tester}
                      onChange={(event) => setQaForm({ ...qaForm, tester: event.target.value })}
                      placeholder="Tester name"
                      required
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="qa-notes">Notes</label>
                  <textarea
                    id="qa-notes"
                    value={qaForm.notes ?? ''}
                    onChange={(event) => setQaForm({ ...qaForm, notes: event.target.value })}
                    placeholder="Extra testing context"
                  />
                </div>
                <button className="button" disabled={qaSaving}>
                  {qaSaving ? 'Adding...' : 'Add QA check'}
                </button>
              </form>

              <div className="qa-list">
                {qaLoading ? <div className="empty table-state">Loading QA checks...</div> : null}
                {!qaLoading && !qaChecks.length ? (
                  <div className="empty table-state">No QA checks yet for this work item.</div>
                ) : null}
                {!qaLoading && qaChecks.length
                  ? qaChecks.map((check) => (
                      <div className="qa-check-card" key={check.id}>
                        <div>
                          <strong>{check.testTitle}</strong>
                          <span>{check.expectedResult}</span>
                          {check.actualResult ? <small>Actual: {check.actualResult}</small> : null}
                          {check.notes ? <small>Notes: {check.notes}</small> : null}
                        </div>
                        <div className="qa-check-actions">
                          <span className={`badge qa-${check.status}`}>{formatLabel(check.status)}</span>
                          <select
                            value={check.status}
                            onChange={(event) => void updateQaStatus(check, event.target.value as QaCheckStatus)}
                          >
                            {QA_CHECK_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {formatLabel(status)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  : null}
              </div>
            </div>
          ) : (
            <div className="empty table-state">Choose QA on a work item to start testing it.</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ItWorkspacePage;
