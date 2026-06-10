import { ROLES } from '../../utils/constants.js';
import DashboardShell from './DashboardShell.jsx';

/** Super Admin dashboard layout */
function SuperAdminLayout() {
  return <DashboardShell role={ROLES.SUPER_ADMIN} />;
}

export default SuperAdminLayout;
