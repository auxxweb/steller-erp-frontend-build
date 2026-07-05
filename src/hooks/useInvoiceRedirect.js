import { useNavigate } from 'react-router-dom';
import useAuth from './useAuth.js';
import useInvoiceBasePath from './useInvoiceBasePath.js';
import { ROLES } from '../utils/constants.js';
import { toast } from '../lib/toastStore.js';

/**
 * After return, open draft invoice editor when billing roles allow it.
 */
export function useInvoiceRedirect() {
  const navigate = useNavigate();
  const invoiceBasePath = useInvoiceBasePath();
  const { user } = useAuth();
  const canOpenInvoice = [ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN, ROLES.EMPLOYEE].includes(
    user?.role,
  );

  const goToInvoiceAfterReturn = (returnResponse, { partial } = {}) => {
    const invoiceId = returnResponse?.data?.invoice?.id;
    if (!invoiceId || partial) return false;
    if (canOpenInvoice) {
      navigate(`${invoiceBasePath}/${invoiceId}`);
      return true;
    }
    toast.success('Return complete — invoice created for billing');
    return false;
  };

  return { goToInvoiceAfterReturn, canOpenInvoice, invoiceBasePath };
}

export default useInvoiceRedirect;
