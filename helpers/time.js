/**
 * browser only - return the current timezone TZ database name
 */
export function getBrowserTimeZone() {
  if (!process.server && window.Intl) {
    return window.Intl.DateTimeFormat().resolvedOptions().timeZone
  }
}
