import { Link } from 'react-router-dom';
import stellerLogo from '../../assets/steller-logo-full.png';
import { cn } from '../../utils/cn.js';

/**
 * STELLER brand mark — source asset is white-on-black; inverted automatically in light mode.
 * @param {'mark' | 'full' | 'compact'} variant — mark = icon crop; full = icon + wordmark; compact = shorter full
 */
function Logo({
  variant = 'full',
  className,
  alt = 'STELLER',
  linkTo,
  onDark = false,
}) {
  const isMark = variant === 'mark';
  const isCompact = variant === 'compact';

  const img = (
    <span
      className={cn(
        'steller-logo inline-flex shrink-0 items-center justify-center',
        isMark && 'steller-logo--mark',
        (variant === 'full' || isCompact) && 'steller-logo--full',
        isCompact && 'steller-logo--compact',
        className
      )}
    >
      <img
        src={stellerLogo}
        alt={alt}
        className={cn(
          'steller-logo__img select-none',
          onDark ? 'steller-logo__img--on-dark' : 'steller-logo__img--theme'
        )}
        decoding="async"
        draggable={false}
      />
    </span>
  );

  if (linkTo) {
    return (
      <Link
        to={linkTo}
        className="steller-logo-link rounded-stellar-lg outline-none transition-stellar hover:opacity-90 focus-visible:ring-2 focus-visible:ring-stellar-focus"
        aria-label={alt}
      >
        {img}
      </Link>
    );
  }

  return img;
}

export default Logo;
