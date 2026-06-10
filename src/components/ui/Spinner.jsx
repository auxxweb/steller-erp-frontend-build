const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
};

function Spinner({ size = 'md', className = '' }) {
  return (
    <span
      className={[
        'inline-block animate-spin rounded-full border-stellar-border-strong border-t-stellar-accent',
        sizes[size] ?? sizes.md,
        className,
      ].join(' ')}
      role="status"
      aria-label="Loading"
    />
  );
}

export default Spinner;
