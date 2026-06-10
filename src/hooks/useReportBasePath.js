import { useLocation } from 'react-router-dom';

export function useReportBasePath() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/branch')) return '/branch/reports';
  return '/admin/reports';
}

export default useReportBasePath;
