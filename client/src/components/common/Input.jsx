const Input = ({
  label,
  error,
  className = '',
  rightIcon,
  leftIcon,
  required = false,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="flex items-center gap-1 text-sm font-medium text-ink mb-1.5">
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          className={`w-full py-2.5 border rounded-[var(--radius-input)] text-sm text-ink placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-150 ${
            leftIcon ? 'pl-10' : 'pl-3'
          } ${rightIcon ? 'pr-10' : 'pr-3'} ${
            error ? 'border-danger focus:ring-danger/30 focus:border-danger' : 'border-slate-200'
          } ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightIcon}</div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-danger flex items-center gap-1">{error}</p>}
    </div>
  );
};

export default Input;