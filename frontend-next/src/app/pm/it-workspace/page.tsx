'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  api,
  CreateWorkItemInput,
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
        <button className="button secondary" onClick={loadWorkItems} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error ? <div className="card error workspace-alert">{error}</div> : null}
      {success ? <div className="card success workspace-alert">{success}</div> : null}

      <div className="workspace-layout">
        <form className="card workspace-form" onSubmit={submit}>
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
                  <div role="columnheader">Action</div>
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
                    <div role="cell">
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
    </section>
  );
};

export default ItWorkspacePage;
