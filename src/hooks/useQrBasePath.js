import { useLocation } from 'react-router-dom';

export function useQrBasePath() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/employee')) return '/employee/scan';
  if (pathname.startsWith('/branch')) return '/branch/scan';
  return '/admin/scan';
}

export default useQrBasePath;
