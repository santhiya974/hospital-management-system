import { Search, X } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = 'Search...', className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-[var(--radius-input)] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;