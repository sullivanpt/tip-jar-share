import _deepEqual from 'deep-equal'

/**
 * deep copy
 */
export function cloneDeep(src) {
  return JSON.parse(JSON.stringify(src))
}

/**
 * deep equal
 */
export function deepEqual(a, b) {
  return _deepEqual(a, b, { strict: true })
}
