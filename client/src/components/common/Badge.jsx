const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  cancelled: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  inactive: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
};

const dotStyles = {
  pending: 'bg-amber-500',
  confirmed: 'bg-blue-500',
  completed: 'bg-emerald-500',
  cancelled: 'bg-red-500',
  active: 'bg-emerald-500',
  inactive: 'bg-slate-400',
};

const Badge = ({ status, children, showDot = true }) => {
  const style = statusStyles[status] || 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
  const dot = dotStyles[status] || 'bg-slate-400';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${style}`}>
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
      {children || status}
    </span>
  );
};

export default Badge;