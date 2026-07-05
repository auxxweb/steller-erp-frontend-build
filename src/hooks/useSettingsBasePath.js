import { useLocation } from 'react-router-dom';

export function useSettingsBasePath() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/branch')) return '/branch/settings';
  if (pathname.startsWith('/employee')) return '/employee/settings';
  return '/admin/settings';
}

export default useSettingsBasePath;
