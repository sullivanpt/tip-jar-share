import _deepEqual from 'deep-equal'
import md5Hex from 'md5-hex'

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

export function objectHash(obj) {
  return md5Hex(JSON.stringify(obj)).slice(0, 7)
}
