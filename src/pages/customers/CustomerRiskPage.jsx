import { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import CustomerDetailShell from '../../components/customers/CustomerDetailShell.jsx';
import RiskScorePanel from '../../components/customers/RiskScorePanel.jsx';
import { useCanManageCustomers } from '../../hooks/useCustomerBasePath.js';
import { recalculateCustomerRisk } from '../../services/customerService.js';

function CustomerRiskPage() {
  const { id } = useParams();
  const location = useLocation();
  const canManage = useCanManageCustomers();
  const [recalculating, setRecalculating] = useState(false);

  return (
    <CustomerDetailShell customerId={id} toast={location.state?.message}>
      {({ customer, refresh, setToast }) => {
        const factors = Array.isArray(customer.riskFactors)
          ? customer.riskFactors
          : customer.riskFactors
            ? Object.values(customer.riskFactors)
            : [];

        const handleRecalculate = async () => {
          setRecalculating(true);
          try {
            await recalculateCustomerRisk(id);
            setToast('Risk score recalculated');
            await refresh();
          } catch (err) {
            setToast(err.response?.data?.message || 'Recalculation failed');
          } finally {
            setRecalculating(false);
          }
        };

        return (
          <RiskScorePanel
            riskScore={customer.riskScore}
            riskLevel={customer.riskLevel}
            riskFactors={factors}
            riskCalculatedAt={customer.riskCalculatedAt}
            canManage={canManage}
            onRecalculate={handleRecalculate}
            recalculating={recalculating}
          />
        );
      }}
    </CustomerDetailShell>
  );
}

export default CustomerRiskPage;
