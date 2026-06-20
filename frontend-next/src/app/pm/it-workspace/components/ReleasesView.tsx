import type { FormEvent } from 'react';
import type { CreateReleaseInput, DeploymentStatus, Release, WorkItem } from '@/lib/api';
import { formatLabel, today } from '../constants';

const CREATE_RELEASE_STATUSES: DeploymentStatus[] = ['draft', 'scheduled'];

type ReleasesViewProps = {
  form: CreateReleaseInput;
  loading: boolean;
  readyWorkItems: WorkItem[];
  releases: Release[];
  saving: boolean;
  onDeploy: (release: Release) => void;
  onFormChange: (form: CreateReleaseInput) => void;
  onRefresh: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export const ReleasesView = ({
  form,
  loading,
  readyWorkItems,
  releases,
  saving,
  onDeploy,
  onFormChange,
  onRefresh,
  onSubmit,
}: ReleasesViewProps) => {
  const toggleWorkItem = (workItemId: string) => {
    const linkedWorkItemIds = form.linkedWorkItemIds ?? [];
    const nextLinkedIds = linkedWorkItemIds.includes(workItemId)
      ? linkedWorkItemIds.filter((id) => id !== workItemId)
      : [...linkedWorkItemIds, workItemId];

    onFormChange({ ...form, linkedWorkItemIds: nextLinkedIds });
  };

  return (
    <div className="release-section">
      <div className="release-layout">
        <form className="card release-form" onSubmit={onSubmit}>
          <h2>Create release</h2>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="release-version">Version</label>
              <input
                id="release-version"
                value={form.version}
                onChange={(event) => onFormChange({ ...form, version: event.target.value })}
                placeholder="v1.0.0"
                minLength={2}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="release-date">Release date</label>
              <input
                id="release-date"
                min={today}
                type="date"
                value={form.releaseDate}
                onChange={(event) => onFormChange({ ...form, releaseDate: event.target.value })}
                required
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="release-summary">Summary</label>
            <textarea
              id="release-summary"
              value={form.summary}
              onChange={(event) => onFormChange({ ...form, summary: event.target.value })}
              placeholder="What is included in this release?"
              minLength={5}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="release-status">Deployment status</label>
            <select
              id="release-status"
              value={form.deploymentStatus}
              onChange={(event) => onFormChange({ ...form, deploymentStatus: event.target.value as DeploymentStatus })}
            >
              {CREATE_RELEASE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatLabel(status)}
                </option>
              ))}
            </select>
          </div>
          <div className="release-ready-list">
            <span>Ready work items</span>
            {!readyWorkItems.length ? (
              <div className="empty table-state">No work items are ready for release yet.</div>
            ) : null}
            {readyWorkItems.map((item) => (
              <label className="release-ready-item" key={item.id}>
                <input
                  checked={(form.linkedWorkItemIds ?? []).includes(item.id)}
                  onChange={() => toggleWorkItem(item.id)}
                  type="checkbox"
                />
                <span>{item.title}</span>
              </label>
            ))}
          </div>
          <button className="button" disabled={saving}>
            {saving ? 'Creating...' : 'Create release'}
          </button>
        </form>

        <div className="card release-list-panel">
          <div className="section-heading">
            <div>
              <h2>Releases</h2>
              <p>{releases.length} release{releases.length === 1 ? '' : 's'} loaded</p>
            </div>
            <button className="button secondary" onClick={onRefresh} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh releases'}
            </button>
          </div>

          {loading ? <div className="empty table-state">Loading releases...</div> : null}
          {!loading && !releases.length ? <div className="empty table-state">No releases created yet.</div> : null}
          {!loading && releases.length ? (
            <div className="release-list">
              {releases.map((release) => (
                <div className="release-card" key={release.id}>
                  <div>
                    <strong>{release.version}</strong>
                    <span>{release.summary}</span>
                    <small>
                      {new Date(release.releaseDate).toLocaleDateString()} - {release.linkedWorkItemIds.length} linked
                    </small>
                  </div>
                  <div className="release-actions">
                    <span className={`badge release-${release.deploymentStatus}`}>
                      {formatLabel(release.deploymentStatus)}
                    </span>
                    <button
                      className="button secondary"
                      disabled={release.deploymentStatus === 'deployed'}
                      onClick={() => onDeploy(release)}
                    >
                      {release.deploymentStatus === 'deployed' ? 'Deployed' : 'Deploy'}
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
