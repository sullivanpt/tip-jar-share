/**
 * deep copy
 */
export function cloneDeep(src) {
  return JSON.parse(JSON.stringify(src))
}
