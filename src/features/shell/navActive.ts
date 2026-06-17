/** Match NavLink active state for a route (mirrors react-router `end` behavior). */
export function isNavItemActive(pathname: string, to: string, end?: boolean): boolean {
  const normalized = pathname.replace(/\/$/, '') || '/'
  const target = to.replace(/\/$/, '') || '/'

  if (end) {
    return normalized === target
  }

  return normalized === target || normalized.startsWith(`${target}/`)
}
