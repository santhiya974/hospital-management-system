export const SkeletonLine = ({ width = '100%', height = '1rem', className = '' }) => (
  <div
    className={`skeleton rounded-md ${className}`}
    style={{ width, height }}
  />
);

export const SkeletonCard = () => (
  <div className="bg-white rounded-[var(--radius-card)] shadow-soft border border-slate-100 p-5 space-y-3">
    <SkeletonLine width="40%" height="0.875rem" />
    <SkeletonLine width="60%" height="1.5rem" />
  </div>
);

export const SkeletonTableRow = ({ columns = 4 }) => (
  <tr className="border-b border-slate-100">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="py-3">
        <SkeletonLine height="0.875rem" />
      </td>
    ))}
  </tr>
);

export const SkeletonStatGrid = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);