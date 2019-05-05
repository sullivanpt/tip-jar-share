/**
 * browser only, return origin
 */
export function getBrowserOrigin() {
  return `${document.location.protocol}//${document.location.host}`
}

/**
 * browser only - return the current timezone TZ database name
 */
export function getBrowserTimeZone() {
  if (!process.server && window.Intl) {
    return window.Intl.DateTimeFormat().resolvedOptions().timeZone
  }
}

/**
 * browser only - print the page
 */
export function print() {
  if (!process.server && window) {
    return window.print()
  }
}
