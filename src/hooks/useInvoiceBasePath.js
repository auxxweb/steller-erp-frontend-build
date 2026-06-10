import { useLocation } from 'react-router-dom';

export function useInvoiceBasePath() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/employee')) return '/employee/invoices';
  if (pathname.startsWith('/branch')) return '/branch/invoices';
  return '/admin/invoices';
}

export default useInvoiceBasePath;
