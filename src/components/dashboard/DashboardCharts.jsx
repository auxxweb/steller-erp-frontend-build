import Card from '../ui/Card.jsx';
import SimplePieChart from './charts/SimplePieChart.jsx';
import SimpleBarChart from './charts/SimpleBarChart.jsx';

function ChartBlock({ title, description, children, className = '' }) {
  return (
    <div className={className}>
      <h3 className="text-sm font-semibold text-stellar-text">{title}</h3>
      {description && <p className="mt-stellar-1 text-xs text-stellar-text-muted">{description}</p>}
      <div className="mt-stellar-3">{children}</div>
    </div>
  );
}

function ChartCard({ title, description, children }) {
  return (
    <Card>
      <Card.Header>
        <Card.Title>{title}</Card.Title>
        {description && <Card.Description>{description}</Card.Description>}
      </Card.Header>
      <Card.Content>{children}</Card.Content>
    </Card>
  );
}

/**
 * @param {object} props
 * @param {object} props.charts
 * @param {boolean} props.showSales
 * @param {boolean} props.inline — pie + bar in one card (delivery)
 * @param {boolean} props.splitInline — pie and bar as separate cards on one row (employee)
 */
function DashboardCharts({ charts = {}, showSales = false, inline = false, splitInline = false }) {
  const hasRentalPie = charts.rentalStatus?.length > 0;
  const hasInvoicePie = showSales && charts.invoiceStatus?.length > 0;
  const hasTransferPie = charts.transferStatus?.length > 0;
  const hasRentalBar = charts.rentalsTrend?.length > 0;
  const hasSalesBar = showSales && charts.salesTrend?.length > 0;

  if (!hasRentalPie && !hasInvoicePie && !hasTransferPie && !hasRentalBar && !hasSalesBar) {
    return null;
  }

  if (splitInline) {
    return (
      <div className="grid gap-stellar-4 lg:grid-cols-2">
        {hasRentalPie && (
          <ChartCard title="Jobs by status">
            <SimplePieChart data={charts.rentalStatus} />
          </ChartCard>
        )}
        {hasRentalBar && (
          <ChartCard title="Bookings — last 7 days">
            <SimpleBarChart data={charts.rentalsTrend} valueLabel="New bookings" />
          </ChartCard>
        )}
      </div>
    );
  }

  if (inline) {
    return (
      <Card>
        <Card.Header>
          <Card.Title>Operations overview</Card.Title>
          <Card.Description>Status and weekly activity at a glance.</Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="grid gap-stellar-8 md:grid-cols-2 xl:grid-cols-3">
            {hasRentalPie && (
              <ChartBlock title="Rentals by status">
                <SimplePieChart data={charts.rentalStatus} inline />
              </ChartBlock>
            )}
            {hasTransferPie && (
              <ChartBlock title="Transfers by status">
                <SimplePieChart data={charts.transferStatus} inline />
              </ChartBlock>
            )}
            {hasRentalBar && (
              <ChartBlock
                title="Bookings — last 7 days"
                className={!hasTransferPie && hasRentalPie ? 'md:col-span-2 xl:col-span-1' : ''}
              >
                <SimpleBarChart data={charts.rentalsTrend} valueLabel="New bookings" inline />
              </ChartBlock>
            )}
          </div>
        </Card.Content>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-stellar-4 lg:grid-cols-2">
        {hasRentalPie && (
          <ChartCard title="Rentals by status">
            <SimplePieChart data={charts.rentalStatus} />
          </ChartCard>
        )}
        {hasInvoicePie && (
          <ChartCard title="Invoices by status">
            <SimplePieChart data={charts.invoiceStatus} />
          </ChartCard>
        )}
        {hasTransferPie && (
          <ChartCard title="Transfers by status">
            <SimplePieChart data={charts.transferStatus} />
          </ChartCard>
        )}
      </div>

      <div className="grid gap-stellar-4 lg:grid-cols-2">
        {hasRentalBar && (
          <ChartCard title="Bookings — last 7 days">
            <SimpleBarChart data={charts.rentalsTrend} valueLabel="New bookings" />
          </ChartCard>
        )}
        {hasSalesBar && (
          <ChartCard title="Sales — last 7 days">
            <SimpleBarChart
              data={charts.salesTrend}
              valueLabel="Revenue (₹)"
              formatValue={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(Math.round(v)))}
            />
          </ChartCard>
        )}
      </div>
    </>
  );
}

export default DashboardCharts;
