const variantStyles = {
  primary: 'gradient-primary text-white shadow-soft hover:shadow-elevated hover:-translate-y-0.5',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-ink',
  danger: 'bg-danger hover:bg-red-700 text-white shadow-soft hover:shadow-elevated',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  ghost: 'text-slate-600 hover:bg-slate-100',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`rounded-[var(--radius-input)] font-semibold transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;