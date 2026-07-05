import { resolveSliceColor, useChartColors } from './chartColors.js';

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const large = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y} Z`;
}

function SimplePieChart({ data = [], size = 160, emptyLabel = 'No data', inline = true }) {
  const { series: colors } = useChartColors();
  const total = data.reduce((s, d) => s + d.value, 0);

  if (!total) {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-stellar-surface-muted text-xs text-stellar-text-muted"
        style={{ width: size, height: size }}
      >
        {emptyLabel}
      </div>
    );
  }

  let angle = 0;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;

  const slices = data.map((d, i) => {
    const slice = (d.value / total) * 360;
    const start = angle;
    const end = angle + slice;
    angle = end;
    return {
      ...d,
      path: describeArc(cx, cy, r, start, end - 0.01),
      color: resolveSliceColor(d.id, i, colors),
    };
  });

  return (
    <div
      className={
        inline
          ? 'flex flex-col items-center gap-stellar-3 sm:flex-row sm:items-center'
          : 'flex flex-col items-center gap-stellar-3'
      }
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 drop-shadow-sm" aria-hidden>
        {slices.map((s) => (
          <path
            key={s.id || s.label}
            d={s.path}
            fill={s.color}
            stroke="var(--stellar-surface)"
            strokeWidth="1.5"
            className="transition-[fill] duration-200"
          />
        ))}
        <circle cx={cx} cy={cy} r={r * 0.45} className="fill-stellar-surface" />
      </svg>
      <ul className="flex w-full min-w-0 flex-1 flex-col gap-stellar-1 text-xs sm:max-w-[200px]">
        {slices.map((s) => (
          <li key={s.id || s.label} className="flex items-center gap-stellar-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm shadow-sm" style={{ background: s.color }} />
            <span className="flex-1 capitalize text-stellar-text-muted">{s.label}</span>
            <span className="font-medium tabular-nums text-stellar-text">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SimplePieChart;
