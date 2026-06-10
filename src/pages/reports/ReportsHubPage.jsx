import { Link } from 'react-router-dom';
import ReportsNav from '../../components/reports/ReportsNav.jsx';
import useReportBasePath from '../../hooks/useReportBasePath.js';

function ReportLink({ to, title, description }) {
  return (
    <Link
      to={to}
      className="block rounded-stellar-xl border border-stellar-border bg-stellar-surface p-stellar-5 transition-stellar hover:border-stellar-accent"
    >
      <h2 className="text-lg font-semibold text-stellar-text">{title}</h2>
      <p className="mt-stellar-1 text-sm text-stellar-text-muted">{description}</p>
    </Link>
  );
}

function ReportsHubPage() {
  const basePath = useReportBasePath();

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stellar-text">Reports</h1>
        <p className="mt-stellar-1 text-sm text-stellar-text-muted">
          Rental job activity and sales performance for your branch or organisation.
        </p>
      </div>

      <ReportsNav />

      <div className="grid gap-stellar-4 sm:grid-cols-2">
        <ReportLink
          to={`${basePath}/rental-jobs`}
          title="Rental job report"
          description="All bookings in a date range — status, customer, amounts collected and outstanding."
        />
        <ReportLink
          to={`${basePath}/sales`}
          title="Sales report"
          description="Invoices issued in a period — totals, tax, payments received and balance due."
        />
      </div>
    </div>
  );
}

export default ReportsHubPage;
