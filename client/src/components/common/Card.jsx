const Card = ({ children, className = '', title, subtitle, action, glass = false, hoverable = false }) => {
  return (
    <div
      className={`${glass ? 'glass' : 'bg-white'} rounded-[var(--radius-card)] shadow-soft border border-slate-100 p-5 sm:p-6 transition-all duration-200 ${
        hoverable ? 'hover:shadow-elevated hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {(title || action) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && <h3 className="text-base font-semibold text-ink">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;