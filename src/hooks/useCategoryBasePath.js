import { useLocation } from 'react-router-dom';

/**
 * Base path for category routes depending on workspace (admin vs branch).
 */
export function useCategoryBasePath() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/branch')) {
    return '/branch/categories';
  }
  return '/admin/categories';
}

export function useIsBranchWorkspace() {
  const { pathname } = useLocation();
  return pathname.startsWith('/branch');
}

export default useCategoryBasePath;
