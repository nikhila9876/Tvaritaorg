/**
 * LoadingSkeleton — shows shimmer placeholders.
 * type: 'page' | 'card' | 'list' | 'table' | 'text'
 */
export default function LoadingSkeleton({ type = 'card', count = 1 }) {
  if (type === 'page') {
    return (
      <div style={{ padding: '4rem 2rem', maxWidth: 800, margin: '0 auto' }}>
        <div className="skeleton" style={{ height: 40, width: '60%', marginBottom: '1rem' }} />
        <div className="skeleton" style={{ height: 20, width: '80%', marginBottom: '0.5rem' }} />
        <div className="skeleton" style={{ height: 20, width: '70%', marginBottom: '2rem' }} />
        <div className="skeleton" style={{ height: 200, width: '100%' }} />
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: 16, width: '50%', marginBottom: '0.5rem' }} />
              <div className="skeleton" style={{ height: 12, width: '80%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className="skeleton" style={{ height: 44, width: '100%', borderRadius: 8 }} />
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 52, width: '100%', borderRadius: 8 }} />
        ))}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 16, width: i % 3 === 0 ? '60%' : '90%' }} />
        ))}
      </div>
    );
  }

  // Default: card grid
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(count, 3)}, 1fr)`, gap: '1.5rem' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card">
          <div className="skeleton" style={{ height: 200, width: '100%', borderRadius: 0 }} />
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="skeleton" style={{ height: 20, width: '70%' }} />
            <div className="skeleton" style={{ height: 14, width: '90%' }} />
            <div className="skeleton" style={{ height: 14, width: '60%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
