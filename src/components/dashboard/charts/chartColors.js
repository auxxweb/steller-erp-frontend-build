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

/** Fallback when CSS vars are unavailable (SSR) */
export const CHART_COLORS_FALLBACK = [
  '#0a0a0a',
  '#27272a',
  '#3f3f46',
  '#52525b',
  '#71717a',
  '#a1a1aa',
  '#d4d4d8',
  '#e4e4e7',
];

export function readChartColors() {
  if (typeof window === 'undefined') {
    return { series: CHART_COLORS_FALLBACK, bar: CHART_COLORS_FALLBACK[0], barMuted: 'rgba(10,10,10,0.28)' };
  }
  const style = getComputedStyle(document.documentElement);
  const series = SERIES_VARS.map((name, i) => {
    const value = style.getPropertyValue(name).trim();
    return value || CHART_COLORS_FALLBACK[i];
  });
  const bar = style.getPropertyValue('--chart-bar').trim() || series[0];
  const barMuted = style.getPropertyValue('--chart-bar-muted').trim() || 'rgba(10, 10, 10, 0.28)';
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

/** @deprecated use useChartColors().series */
export const PIE_COLORS = CHART_COLORS_FALLBACK;
