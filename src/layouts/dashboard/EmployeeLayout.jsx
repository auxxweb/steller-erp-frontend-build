import { ROLES } from '../../utils/constants.js';
import DashboardShell from './DashboardShell.jsx';

/** Employee dashboard layout */
function EmployeeLayout() {
  return <DashboardShell role={ROLES.EMPLOYEE} />;
}

export default EmployeeLayout;
