/** Map list rows to SearchableSelect options. */
export function toSelectOptions(items, { valueKey = 'id', getLabel, getKeywords } = {}) {
  return (items || []).map((item) => {
    const rawValue = item[valueKey] ?? item.id ?? item._id ?? item.value;
    return {
      value: rawValue != null ? String(rawValue) : '',
      label: getLabel ? getLabel(item) : String(item.label ?? item.name ?? rawValue ?? ''),
      keywords: getKeywords ? getKeywords(item) : undefined,
      disabled: Boolean(item.disabled),
    };
  });
}

/** Prepend a blank / placeholder option. */
export function withEmptyOption(options, label = 'Select…') {
  return [{ value: '', label }, ...options];
}
