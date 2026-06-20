type WorkspaceSummaryProps = {
  active: number;
  ready: number;
  released: number;
  total: number;
};

export const WorkspaceSummary = ({ active, ready, released, total }: WorkspaceSummaryProps) => {
  return (
    <div className="workspace-summary">
      <div className="card summary-card">
        <span>Total work</span>
        <strong>{total}</strong>
      </div>
      <div className="card summary-card">
        <span>Active</span>
        <strong>{active}</strong>
      </div>
      <div className="card summary-card">
        <span>Ready for release</span>
        <strong>{ready}</strong>
      </div>
      <div className="card summary-card">
        <span>Released</span>
        <strong>{released}</strong>
      </div>
    </div>
  );
};
