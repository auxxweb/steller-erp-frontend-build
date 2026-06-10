import { ROLES } from '../../utils/constants.js';
import DashboardShell from './DashboardShell.jsx';

/** Delivery Staff dashboard layout */
function DeliveryStaffLayout() {
  return <DashboardShell role={ROLES.DELIVERY_STAFF} />;
}

export default DeliveryStaffLayout;
