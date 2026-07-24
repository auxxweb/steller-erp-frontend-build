const DEFAULT_PAGE_SIZE = 100;

/**
 * Walk paginated list APIs until every page is loaded.
 * @param {(page: number, limit: number) => Promise<{ items: any[], pages: number }>} fetchPage
 */
export async function fetchAllPages(fetchPage, { pageSize = DEFAULT_PAGE_SIZE } = {}) {
  const all = [];
  let page = 1;
  let pages = 1;

  do {
    const { items, pages: totalPages } = await fetchPage(page, pageSize);
    all.push(...(items || []));
    pages = Math.max(1, Number(totalPages) || 1);
    page += 1;
  } while (page <= pages);

  return all;
}
