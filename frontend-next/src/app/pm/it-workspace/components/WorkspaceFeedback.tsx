type WorkspaceFeedbackProps = {
  error: string;
  success: string;
};

export const WorkspaceFeedback = ({ error, success }: WorkspaceFeedbackProps) => {
  if (!error && !success) return null;

  const isError = Boolean(error);

  return (
    <div
      className={`workspace-feedback ${isError ? 'workspace-feedback-error' : 'workspace-feedback-success'}`}
      role={isError ? 'alert' : 'status'}
    >
      <strong>{isError ? 'Could not complete action' : 'Action completed'}</strong>
      <p>{error || success}</p>
    </div>
  );
};
