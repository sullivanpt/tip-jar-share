/**
 * remove falsy values, then comma+space separate
 * see https://davidwalsh.name/javascript-tricks
 */
export function arrayToCommaString(value) {
  if (!value) return
  return value.filter(Boolean).join(', ')
}
