/** URL value when no single project is selected (all projects in team scope). */
export const BROWSE_ALL_PROJECTS = "all"

export function parseProjectParam(
  value: string | string[] | undefined
): string | null {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw || raw === BROWSE_ALL_PROJECTS) return null
  return raw.trim() || null
}
