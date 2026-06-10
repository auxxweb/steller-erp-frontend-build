import PaginationBar from '../ui/PaginationBar.jsx';
import TransferTable from './TransferTable.jsx';
import TransferMobileCard from './TransferMobileCard.jsx';

/**
 * Responsive transfer list: cards on mobile, table on desktop.
 */
function TransferListView({
  transfers,
  loading,
  basePath,
  pagination,
  onPageChange,
  emptyMessage = 'No transfers found.',
  showProgress = true,
}) {
  if (loading) {
    return (
      <div className="p-stellar-8 text-center text-sm text-stellar-text-muted">Loading…</div>
    );
  }

  if (!transfers?.length) {
    return (
      <div className="p-stellar-8 text-center text-sm text-stellar-text-muted">{emptyMessage}</div>
    );
  }

  return (
    <>
      <div className="space-y-stellar-3 p-stellar-4 md:hidden">
        {transfers.map((t) => (
          <TransferMobileCard
            key={t.id}
            transfer={t}
            basePath={basePath}
            showProgress={showProgress}
          />
        ))}
      </div>

      <div className="hidden md:block">
        <TransferTable transfers={transfers} loading={false} basePath={basePath} />
      </div>

      {pagination && (
        <PaginationBar
          page={pagination.page}
          pages={pagination.pages}
          total={pagination.total}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}

export default TransferListView;
