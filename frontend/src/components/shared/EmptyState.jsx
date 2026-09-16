import { PackageSearch } from 'lucide-react';

export default function EmptyState({
  icon: Icon = PackageSearch,
  title = 'Nothing here yet',
  description = '',
  action = null,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={56} strokeWidth={1} />
      </div>
      <p className="empty-state-title">{title}</p>
      {description && <p className="empty-state-desc">{description}</p>}
      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
    </div>
  );
}
