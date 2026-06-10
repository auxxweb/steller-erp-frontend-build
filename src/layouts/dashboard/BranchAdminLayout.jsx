import { ROLES } from '../../utils/constants.js';
import DashboardShell from './DashboardShell.jsx';

/** Branch Admin dashboard layout */
function BranchAdminLayout() {
  return <DashboardShell role={ROLES.BRANCH_ADMIN} />;
}

export default BranchAdminLayout;
