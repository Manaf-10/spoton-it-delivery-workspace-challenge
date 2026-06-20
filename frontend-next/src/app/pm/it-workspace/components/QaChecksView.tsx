import type { FormEvent } from 'react';
import type { CreateQaCheckInput, QaCheck, QaCheckStatus, WorkItem } from '@/lib/api';
import { QA_CHECK_STATUSES } from '@/lib/api';
import { formatLabel, INITIAL_QA_FORM } from '../constants';

type QaChecksViewProps = {
  currentUserName: string;
  qaChecks: QaCheck[];
  qaForm: CreateQaCheckInput;
  qaLoading: boolean;
  qaSaving: boolean;
  qaSummary: {
    failed: number;
    passed: number;
    pending: number;
    total: number;
  };
  selectedWorkItem: WorkItem | null;
  selectedWorkItemId: string;
  workItems: WorkItem[];
  onQaFormChange: (form: CreateQaCheckInput) => void;
  onRefresh: () => void;
  onSelectWorkItem: (workItem: WorkItem) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdateStatus: (qaCheck: QaCheck, status: QaCheckStatus) => void;
  onClearSelection: () => void;
};

export const QaChecksView = ({
  currentUserName,
  qaChecks,
  qaForm,
  qaLoading,
  qaSaving,
  qaSummary,
  selectedWorkItem,
  selectedWorkItemId,
  workItems,
  onQaFormChange,
  onRefresh,
  onSelectWorkItem,
  onSubmit,
  onUpdateStatus,
  onClearSelection,
}: QaChecksViewProps) => {
  return (
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
            <button className="button secondary" onClick={onRefresh} disabled={qaLoading}>
              {qaLoading ? 'Refreshing...' : 'Refresh QA'}
            </button>
          ) : null}
        </div>

        <div className="field qa-picker">
          <label htmlFor="qa-work-item">Work item</label>
          <select
            id="qa-work-item"
            value={selectedWorkItemId}
            onChange={(event) => {
              const workItem = workItems.find((item) => item.id === event.target.value);
              if (workItem) onSelectWorkItem(workItem);
              if (!event.target.value) {
                onClearSelection();
                onQaFormChange({ ...INITIAL_QA_FORM, tester: currentUserName });
              }
            }}
          >
            <option value="">Select a work item</option>
            {workItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
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
            <form className="qa-form" onSubmit={onSubmit}>
              <div className="field">
                <label htmlFor="qa-title">Test title</label>
                <input
                  id="qa-title"
                  value={qaForm.testTitle}
                  onChange={(event) => onQaFormChange({ ...qaForm, testTitle: event.target.value })}
                  placeholder="Verify happy path"
                  minLength={3}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="qa-expected">Expected result</label>
                <textarea
                  id="qa-expected"
                  value={qaForm.expectedResult}
                  onChange={(event) => onQaFormChange({ ...qaForm, expectedResult: event.target.value })}
                  placeholder="What should happen?"
                  minLength={3}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="qa-actual">Actual result</label>
                <textarea
                  id="qa-actual"
                  value={qaForm.actualResult ?? ''}
                  onChange={(event) => onQaFormChange({ ...qaForm, actualResult: event.target.value })}
                  placeholder="What happened during testing?"
                />
              </div>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="qa-status">Status</label>
                  <select
                    id="qa-status"
                    value={qaForm.status}
                    onChange={(event) => onQaFormChange({ ...qaForm, status: event.target.value as QaCheckStatus })}
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
                    onChange={(event) => onQaFormChange({ ...qaForm, tester: event.target.value })}
                    placeholder="Tester name"
                    minLength={1}
                    required
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="qa-notes">Notes</label>
                <textarea
                  id="qa-notes"
                  value={qaForm.notes ?? ''}
                  onChange={(event) => onQaFormChange({ ...qaForm, notes: event.target.value })}
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
                          onChange={(event) => onUpdateStatus(check, event.target.value as QaCheckStatus)}
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
  );
};
