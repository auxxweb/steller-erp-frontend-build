import { useEffect, useRef } from 'react';

/**
 * Run `load` when filters/page change, but reset to page 1 first when filters change
 * (avoids a duplicate API call with stale page number).
 */
export function useFilterPageEffect({ filterKey, page, setPage, load }) {
  const prevFilterKey = useRef(filterKey);

  useEffect(() => {
    if (prevFilterKey.current !== filterKey) {
      prevFilterKey.current = filterKey;
      if (page !== 1) {
        setPage(1);
        return;
      }
    }
    load();
  }, [filterKey, page, setPage, load]);
}

export default useFilterPageEffect;
