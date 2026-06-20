import type { FormEvent } from 'react';
import type {
  CreateWorkItemInput,
  WorkItem,
  WorkItemPriority,
  WorkItemStatus,
  WorkItemType,
} from '@/lib/api';
import { WORK_ITEM_PRIORITIES, WORK_ITEM_STATUSES, WORK_ITEM_TYPES } from '@/lib/api';
import { formatLabel, NEXT_STATUSES, today } from '../constants';
import type { WorkItemFiltersState } from '../types';

type WorkItemsViewProps = {
  filteredAssignees: string[];
  filters: WorkItemFiltersState;
  form: CreateWorkItemInput;
  loading: boolean;
  saving: boolean;
  workItems: WorkItem[];
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: (workItem: WorkItem) => void;
  onFilterChange: (filters: WorkItemFiltersState) => void;
  onFormChange: (form: CreateWorkItemInput) => void;
  onRefresh: () => void;
  onSelectQa: (workItem: WorkItem) => void;
  onStatusChange: (workItem: WorkItem, status: WorkItemStatus) => void;
};

export const WorkItemsView = ({
  filteredAssignees,
  filters,
  form,
  loading,
  saving,
  workItems,
  onCreate,
  onDelete,
  onFilterChange,
  onFormChange,
  onRefresh,
  onSelectQa,
  onStatusChange,
}: WorkItemsViewProps) => {
  return (
    <div className="workspace-layout">
      <form id="create-work-item" className="card workspace-form" onSubmit={onCreate}>
        <h2>Create work item</h2>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={form.title}
            onChange={(event) => onFormChange({ ...form, title: event.target.value })}
            placeholder="Add release readiness checks"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={form.description}
            onChange={(event) => onFormChange({ ...form, description: event.target.value })}
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
              onChange={(event) => onFormChange({ ...form, type: event.target.value as WorkItemType })}
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
              onChange={(event) => onFormChange({ ...form, priority: event.target.value as WorkItemPriority })}
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
              onChange={(event) => onFormChange({ ...form, assignee: event.target.value })}
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
              onChange={(event) => onFormChange({ ...form, dueDate: event.target.value })}
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
              onChange={(event) => onFilterChange({ ...filters, search: event.target.value })}
              placeholder="Title or description"
            />
          </div>
          <div className="field">
            <label htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(event) => onFilterChange({ ...filters, status: event.target.value as '' | WorkItemStatus })}
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
              onChange={(event) => onFilterChange({ ...filters, priority: event.target.value as '' | WorkItemPriority })}
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
              onChange={(event) => onFilterChange({ ...filters, assignee: event.target.value })}
              placeholder="Anyone"
            />
            <datalist id="assignees">
              {filteredAssignees.map((assignee) => (
                <option key={assignee} value={assignee} />
              ))}
            </datalist>
          </div>
          <button className="button secondary" onClick={onRefresh} disabled={loading}>
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
                        if (event.target.value) onStatusChange(item, event.target.value as WorkItemStatus);
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
                    <button className="text-button" onClick={() => onSelectQa(item)}>
                      QA
                    </button>
                    <button className="text-button" onClick={() => onDelete(item)}>
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
  );
};
