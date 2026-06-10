import { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import CustomerDetailShell from '../../components/customers/CustomerDetailShell.jsx';
import IdProofPreviewGrid from '../../components/customers/IdProofPreviewGrid.jsx';
import IdProofUploadSection from '../../components/customers/IdProofUploadSection.jsx';
import GuarantorSection from '../../components/customers/GuarantorSection.jsx';
import RiskScorePanel from '../../components/customers/RiskScorePanel.jsx';
import BlockCustomerModal from '../../components/customers/BlockCustomerModal.jsx';
import { useCanManageCustomers } from '../../hooks/useCustomerBasePath.js';
import {
  blockCustomer,
  unblockCustomer,
  verifyCustomerIdProof,
} from '../../services/customerService.js';
import { CUSTOMER_STATUS, CUSTOMER_TYPE } from '../../utils/customerConstants.js';

function formatMoney(val) {
  if (val == null || val === '') return '—';
  return `₹${Number(val).toLocaleString('en-IN')}`;
}

function CustomerProfilePage() {
  const { id } = useParams();
  const location = useLocation();
  const canManage = useCanManageCustomers();
  const [blockOpen, setBlockOpen] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);

  return (
    <CustomerDetailShell customerId={id} toast={location.state?.message}>
      {({ customer, refresh, setToast }) => {
        const proofs = customer.idProofs?.length
          ? customer.idProofs
          : customer.idProof?.type
            ? [customer.idProof]
            : [];

        const handleBlock = async (reason) => {
          setBlocking(true);
          try {
            await blockCustomer(id, reason);
            setToast('Customer blocked');
            setBlockOpen(false);
            await refresh();
          } catch (err) {
            setToast(err.response?.data?.message || 'Block failed');
          } finally {
            setBlocking(false);
          }
        };

        const handleUnblock = async () => {
          try {
            await unblockCustomer(id);
            setToast('Customer unblocked');
            await refresh();
          } catch (err) {
            setToast(err.response?.data?.message || 'Unblock failed');
          }
        };

        const handleVerify = async (proofId) => {
          setVerifyingId(proofId);
          try {
            await verifyCustomerIdProof(id, proofId);
            setToast('ID proof verified');
            await refresh();
          } catch (err) {
            setToast(err.response?.data?.message || 'Verification failed');
          } finally {
            setVerifyingId(null);
          }
        };

        return (
          <div className="space-y-stellar-6">
            <RiskScorePanel
              riskScore={customer.riskScore}
              riskLevel={customer.riskLevel}
              riskFactors={
                Array.isArray(customer.riskFactors) ? customer.riskFactors : []
              }
              riskCalculatedAt={customer.riskCalculatedAt}
            />

            <div className="grid gap-stellar-6 lg:grid-cols-2">
              <Card variant="muted" className="!p-stellar-5">
                <h2 className="text-sm font-semibold text-stellar-text">Contact</h2>
                <dl className="mt-stellar-4 space-y-stellar-3 text-sm">
                  <div className="flex justify-between gap-stellar-4">
                    <dt className="text-stellar-text-muted">Type</dt>
                    <dd className="capitalize">{customer.customerType}</dd>
                  </div>
                  <div className="flex justify-between gap-stellar-4">
                    <dt className="text-stellar-text-muted">Phone</dt>
                    <dd className="tabular-nums">{customer.phone}</dd>
                  </div>
                  {customer.alternatePhone && (
                    <div className="flex justify-between gap-stellar-4">
                      <dt className="text-stellar-text-muted">Alt. phone</dt>
                      <dd className="tabular-nums">{customer.alternatePhone}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-stellar-4">
                    <dt className="text-stellar-text-muted">Email</dt>
                    <dd>{customer.email || '—'}</dd>
                  </div>
                  {customer.customerType === CUSTOMER_TYPE.BUSINESS && (
                    <>
                      <div className="flex justify-between gap-stellar-4">
                        <dt className="text-stellar-text-muted">Company</dt>
                        <dd>{customer.company || '—'}</dd>
                      </div>
                      <div className="flex justify-between gap-stellar-4">
                        <dt className="text-stellar-text-muted">GSTIN</dt>
                        <dd>{customer.gstin || '—'}</dd>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between gap-stellar-4">
                    <dt className="text-stellar-text-muted">Branch</dt>
                    <dd>{customer.branch?.name || '—'}</dd>
                  </div>
                </dl>
              </Card>

              <Card variant="muted" className="!p-stellar-5">
                <h2 className="text-sm font-semibold text-stellar-text">Credit & balance</h2>
                <dl className="mt-stellar-4 space-y-stellar-3 text-sm">
                  <div className="flex justify-between gap-stellar-4">
                    <dt className="text-stellar-text-muted">Credit limit</dt>
                    <dd className="font-medium tabular-nums">{formatMoney(customer.creditLimit)}</dd>
                  </div>
                  <div className="flex justify-between gap-stellar-4">
                    <dt className="text-stellar-text-muted">Outstanding</dt>
                    <dd className="font-medium tabular-nums">
                      {formatMoney(customer.outstandingBalance)}
                    </dd>
                  </div>
                </dl>
                {customer.address?.line1 && (
                  <div className="mt-stellar-4 border-t border-stellar-border pt-stellar-4">
                    <h3 className="text-xs font-medium uppercase text-stellar-text-subtle">
                      Address
                    </h3>
                    <p className="mt-stellar-2 text-sm text-stellar-text-muted">
                      {[
                        customer.address.line1,
                        customer.address.line2,
                        customer.address.city,
                        customer.address.state,
                        customer.address.pincode,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                )}
              </Card>
            </div>

            {customer.notes && (
              <Card variant="muted" className="!p-stellar-5">
                <h2 className="text-sm font-semibold text-stellar-text">Notes</h2>
                <p className="mt-stellar-2 whitespace-pre-wrap text-sm text-stellar-text-muted">
                  {customer.notes}
                </p>
              </Card>
            )}

            <Card variant="muted" className="!p-stellar-5">
              <h2 className="text-sm font-semibold text-stellar-text">ID proofs</h2>
              <div className="mt-stellar-4">
                <IdProofPreviewGrid
                  proofs={proofs}
                  canManage={canManage}
                  verifyingId={verifyingId}
                  onVerify={handleVerify}
                />
              </div>
              {canManage && (
                <div className="mt-stellar-6">
                  <h3 className="mb-stellar-3 text-sm font-medium text-stellar-text">
                    Upload new proof
                  </h3>
                  <IdProofUploadSection customerId={id} onUploaded={refresh} />
                </div>
              )}
            </Card>

            <GuarantorSection customerId={id} canManage={canManage} onChanged={refresh} />

            {canManage && (
              <Card variant="muted" className="!p-stellar-5">
                <h2 className="text-sm font-semibold text-stellar-text">Account actions</h2>
                {customer.status === CUSTOMER_STATUS.BLOCKED ? (
                  <div className="mt-stellar-4 space-y-stellar-3">
                    <p className="text-sm text-stellar-text-muted">
                      Blocked: {customer.blockedReason || 'No reason recorded'}
                    </p>
                    <Button type="button" variant="secondary" onClick={handleUnblock}>
                      Unblock customer
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="danger"
                    className="mt-stellar-4"
                    onClick={() => setBlockOpen(true)}
                  >
                    Block customer
                  </Button>
                )}
              </Card>
            )}

            <BlockCustomerModal
              customer={customer}
              open={blockOpen}
              loading={blocking}
              onConfirm={handleBlock}
              onCancel={() => setBlockOpen(false)}
            />
          </div>
        );
      }}
    </CustomerDetailShell>
  );
}

export default CustomerProfilePage;
