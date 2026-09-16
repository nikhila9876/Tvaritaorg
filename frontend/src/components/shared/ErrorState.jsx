import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="empty-state">
      <div style={{ color: 'var(--color-error)' }}>
        <AlertTriangle size={56} strokeWidth={1} />
      </div>
      <p className="empty-state-title">Oops!</p>
      <p className="empty-state-desc">{message}</p>
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry} style={{ marginTop: '0.5rem' }}>
          <RefreshCcw size={16} />
          Try again
        </button>
      )}
    </div>
  );
}
