import { Search } from 'lucide-react';
import { useState } from 'react';

export default function SearchBar({
  placeholder = 'Search…',
  onSearch,
  initialValue = '',
  className = '',
  size = 'md',
}) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(value.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={className}
      style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '100%' }}
      role="search"
    >
      <Search
        size={size === 'sm' ? 16 : 20}
        style={{
          position: 'absolute',
          left: '0.875rem',
          color: 'var(--color-muted)',
          pointerEvents: 'none',
        }}
      />
      <input
        type="search"
        className="form-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        style={{
          paddingLeft: size === 'sm' ? '2.25rem' : '2.75rem',
          paddingRight: '1rem',
          fontSize: size === 'sm' ? 'var(--text-sm)' : 'var(--text-base)',
        }}
        aria-label={placeholder}
      />
    </form>
  );
}
