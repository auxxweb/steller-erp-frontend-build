import { cn } from '../../utils/cn.js';

const variants = {
  default: 'card',
  elevated: 'card-elevated',
  glass: 'card-glass',
  muted: 'card-muted',
};

function Card({
  children,
  variant = 'default',
  hover = false,
  className = '',
  as: Component = 'div',
  ...props
}) {
  const needsBase = variant === 'default';

  return (
    <Component
      className={cn(needsBase && 'card', variants[variant], hover && 'card-hover', className)}
      {...props}
    >
      {children}
    </Component>
  );
}

function CardHeader({ children, className = '' }) {
  return <div className={cn('card-header', className)}>{children}</div>;
}

function CardTitle({ children, className = '' }) {
  return <h3 className={cn('card-title', className)}>{children}</h3>;
}

function CardDescription({ children, className = '' }) {
  return <p className={cn('card-description', className)}>{children}</p>;
}

function CardContent({ children, className = '' }) {
  return <div className={cn('mt-stellar-4', className)}>{children}</div>;
}

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;

export default Card;
