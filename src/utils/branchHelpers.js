/** Internal pseudo-branch used for global catalog storage — never show in UI pickers */
export const SYSTEM_BRANCH_CODE = 'COMMON';

export function isSystemBranch(branch) {
  if (!branch) return false;
  const code = typeof branch === 'string' ? branch : branch.code;
  return code === SYSTEM_BRANCH_CODE;
}

/** Real rental/operations branches only (excludes COMMON inventory branch). */
export function filterOperationalBranches(branches = []) {
  return branches.filter((b) => !isSystemBranch(b));
}

/** Human label for branch references in tables and detail views. */
export function formatBranchDisplay(branch) {
  if (!branch) return '—';
  if (isSystemBranch(branch)) return 'All branches';
  if (typeof branch === 'string') return branch;
  if (branch.name && branch.code) return `${branch.name} (${branch.code})`;
  return branch.name || branch.code || '—';
}

/** Option label for branch `<select>` menus. */
export function formatBranchOptionLabel(branch) {
  if (!branch || isSystemBranch(branch)) return 'All branches';
  return branch.code ? `${branch.name} (${branch.code})` : branch.name;
}
