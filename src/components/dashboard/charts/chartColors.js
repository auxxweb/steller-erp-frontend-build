import { useCallback, useEffect, useState } from 'react';

const SERIES_VARS = [
  '--chart-series-1',
  '--chart-series-2',
  '--chart-series-3',
  '--chart-series-4',
  '--chart-series-5',
  '--chart-series-6',
  '--chart-series-7',
  '--chart-series-8',
];

/** Vibrant fallback palette (light theme) */
export const CHART_COLORS_FALLBACK = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
];

/** Semantic colors for known status / category ids in pie charts */
export const STATUS_CHART_COLORS = {
  active: '#22c55e',
  picked_up: '#3b82f6',
  overdue: '#ef4444',
  reserved: '#8b5cf6',
  confirmed: '#06b6d4',
  returned: '#64748b',
  partially_returned: '#f97316',
  maintenance: '#eab308',
  cancelled: '#94a3b8',
  draft: '#cbd5e1',
  closed: '#475569',
  paid: '#22c55e',
  issued: '#6366f1',
  partially_paid: '#f59e0b',
  void: '#94a3b8',
  present: '#22c55e',
  absent: '#ef4444',
  late: '#f97316',
  half_day: '#eab308',
  on_leave: '#8b5cf6',
};

export function resolveSliceColor(id, index, series) {
  const key = typeof id === 'string' ? id.toLowerCase().replace(/\s+/g, '_') : null;
  if (key && STATUS_CHART_COLORS[key]) return STATUS_CHART_COLORS[key];
  return series[index % series.length];
}

export function readChartColors() {
  if (typeof window === 'undefined') {
    return {
      series: CHART_COLORS_FALLBACK,
      bar: CHART_COLORS_FALLBACK[0],
      barMuted: 'rgba(99, 102, 241, 0.22)',
    };
  }
  const style = getComputedStyle(document.documentElement);
  const series = SERIES_VARS.map((name, i) => {
    const value = style.getPropertyValue(name).trim();
    return value || CHART_COLORS_FALLBACK[i];
  });
  const bar = style.getPropertyValue('--chart-bar').trim() || series[0];
  const barMuted = style.getPropertyValue('--chart-bar-muted').trim() || 'rgba(99, 102, 241, 0.22)';
  return { series, bar, barMuted };
}

/** Reactive palette that tracks light/dark theme */
export function useChartColors() {
  const [palette, setPalette] = useState(readChartColors);

  const refresh = useCallback(() => {
    setPalette(readChartColors());
  }, []);

  useEffect(() => {
    refresh();
    const root = document.documentElement;
    const observer = new MutationObserver(refresh);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    const onScheme = () => refresh();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', onScheme);
    return () => {
      observer.disconnect();
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', onScheme);
    };
  }, [refresh]);

  return palette;
}

/** Accent tints for KPI / stat cards (uses chart series) */
export const KPI_CARD_STYLES = [
  {
    border: 'border-l-indigo-500',
    value: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-500/5',
  },
  {
    border: 'border-l-emerald-500',
    value: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/5',
  },
  {
    border: 'border-l-violet-500',
    value: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-500/5',
  },
  {
    border: 'border-l-amber-500',
    value: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/5',
  },
  {
    border: 'border-l-cyan-500',
    value: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-500/5',
  },
  {
    border: 'border-l-rose-500',
    value: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-500/5',
  },
];

export const QUICK_ACTION_ACCENTS = [
  {
    border: 'border-indigo-200 dark:border-indigo-800/60',
    bg: 'bg-indigo-50/80 dark:bg-indigo-950/30',
    dot: 'bg-indigo-500',
  },
  {
    border: 'border-emerald-200 dark:border-emerald-800/60',
    bg: 'bg-emerald-50/80 dark:bg-emerald-950/30',
    dot: 'bg-emerald-500',
  },
  {
    border: 'border-violet-200 dark:border-violet-800/60',
    bg: 'bg-violet-50/80 dark:bg-violet-950/30',
    dot: 'bg-violet-500',
  },
  {
    border: 'border-amber-200 dark:border-amber-800/60',
    bg: 'bg-amber-50/80 dark:bg-amber-950/30',
    dot: 'bg-amber-500',
  },
  {
    border: 'border-cyan-200 dark:border-cyan-800/60',
    bg: 'bg-cyan-50/80 dark:bg-cyan-950/30',
    dot: 'bg-cyan-500',
  },
  {
    border: 'border-rose-200 dark:border-rose-800/60',
    bg: 'bg-rose-50/80 dark:bg-rose-950/30',
    dot: 'bg-rose-500',
  },
];

/** @deprecated use useChartColors().series */
export const PIE_COLORS = CHART_COLORS_FALLBACK;
