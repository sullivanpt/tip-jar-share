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
  if (!process.server && Intl) {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
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

/**
 * browser only - is app in background, minimized, etc.
 */
export function isBrowserHidden() {
  if (!process.server && document) {
    return document.hidden // || document.msHidden || document.webkitHidden
  }
}
