/**
 * browser only, return origin
 */
export function getBrowserOrigin() {
  return `${document.location.protocol}//${document.location.host}`
}
