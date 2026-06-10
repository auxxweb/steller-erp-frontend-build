import { cn } from '../../utils/cn.js';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const sizes = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
};

function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  isLoading = false,
  disabled,
  ...props
}) {
  const isIconOnly = variant === 'icon';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'btn',
        isIconOnly ? 'btn-icon' : variants[variant],
        !isIconOnly && sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
