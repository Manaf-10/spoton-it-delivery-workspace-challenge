import type { WorkspaceView } from '../types';

type WorkspaceActionsProps = {
  activeView: WorkspaceView;
  loading: boolean;
  onRefresh: () => void;
  onViewChange: (view: WorkspaceView) => void;
};

export const WorkspaceActions = ({ activeView, loading, onRefresh, onViewChange }: WorkspaceActionsProps) => {
  return (
    <div className="card workspace-actions">
      <div>
        <h2>Actions</h2>
        <p>Switch between the main workspace areas without crowding the page.</p>
      </div>
      <div className="actions-list">
        <button
          className={`button ${activeView === 'work-items' ? '' : 'secondary'}`}
          onClick={() => onViewChange('work-items')}
        >
          Work items
        </button>
        <button
          className={`button ${activeView === 'qa-checks' ? '' : 'secondary'}`}
          onClick={() => onViewChange('qa-checks')}
        >
          QA checks
        </button>
        <button
          className={`button ${activeView === 'releases' ? '' : 'secondary'}`}
          onClick={() => onViewChange('releases')}
        >
          Releases
        </button>
        <button className="button secondary" onClick={onRefresh} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
};
