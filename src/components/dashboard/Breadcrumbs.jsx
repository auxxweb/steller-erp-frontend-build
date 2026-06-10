import { Link, useLocation } from 'react-router-dom';
import { BREADCRUMB_LABELS } from '../../routes/config/dashboardConfig.js';
import { cn } from '../../utils/cn.js';

function Breadcrumbs({ basePath, workspaceTitle }) {
  const { pathname } = useLocation();

  const relative = pathname.startsWith(basePath)
    ? pathname.slice(basePath.length).replace(/^\//, '')
    : '';

  const segments = relative ? relative.split('/').filter(Boolean) : [];

  const crumbs = [
    { label: workspaceTitle, to: `${basePath}/dashboard` },
    ...segments.map((seg, i) => {
      const path = `${basePath}/${segments.slice(0, i + 1).join('/')}`;
      return {
        label: BREADCRUMB_LABELS[seg] || seg.replace(/-/g, ' '),
        to: path,
        isLast: i === segments.length - 1,
      };
    }),
  ];

  if (segments.length === 1 && segments[0] === 'dashboard') {
    crumbs.pop();
  }

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex flex-wrap items-center gap-stellar-1 text-sm">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <li key={crumb.to} className="flex min-w-0 items-center gap-stellar-1">
              {index > 0 && (
                <span className="text-stellar-text-subtle" aria-hidden>
                  /
                </span>
              )}
              {isLast ? (
                <span
                  className="truncate font-medium capitalize text-stellar-text"
                  aria-current="page"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.to}
                  className={cn(
                    'truncate capitalize text-stellar-text-muted transition-stellar hover:text-stellar-text',
                  )}
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
