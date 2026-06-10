import { useChartColors } from './chartColors.js';

function SimpleBarChart({ data = [], valueLabel = 'Count', formatValue, inline = false }) {
  const { series: colors, bar, barMuted } = useChartColors();
  const max = Math.max(...data.map((d) => d.value), 1);
  const fmt = formatValue || ((v) => String(v));

  if (!data.length) {
    return <p className="py-stellar-6 text-center text-xs text-stellar-text-muted">No data for this period</p>;
  }

  return (
    <div className={inline ? 'flex h-full min-h-[10rem] flex-col justify-end' : 'space-y-stellar-2'}>
      <div className={`flex items-end gap-1 sm:gap-2 ${inline ? 'flex-1' : 'h-40'}`}>
        {data.map((d, i) => {
          const pct = Math.max((d.value / max) * 100, d.value > 0 ? 4 : 0);
          const fill = d.value > 0 ? colors[i % colors.length] || bar : barMuted;
          return (
            <div key={d.date || d.label} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] font-medium tabular-nums text-stellar-text-muted">
                {d.value > 0 ? fmt(d.value) : ''}
              </span>
              <div
                className="w-full rounded-t-stellar-sm transition-all duration-200"
                style={{ height: `${pct}%`, backgroundColor: fill, minHeight: d.value > 0 ? '4px' : 0 }}
                title={`${d.label}: ${fmt(d.value)}`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1 sm:gap-2">
        {data.map((d) => (
          <p key={d.date || d.label} className="flex-1 truncate text-center text-[10px] text-stellar-text-subtle">
            {d.label}
          </p>
        ))}
      </div>
      <p className="text-center text-[10px] uppercase tracking-wide text-stellar-text-subtle">{valueLabel}</p>
    </div>
  );
}

export default SimpleBarChart;
