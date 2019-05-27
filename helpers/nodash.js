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

export function pick(obj, keys) {
  return keys.reduce((acc, key) => {
    if (obj[key] !== undefined) acc[key] = obj[key]
    return acc
  }, {})
}

export function objectHash(obj) {
  return md5Hex(JSON.stringify(obj)).slice(0, 7)
}

export function isString(obj) {
  return typeof obj === 'string'
}

export function coerceBoolean(obj, fallback = false) {
  if (obj === false || obj === true) return obj
  return fallback
}

export function isBoolean(obj) {
  return obj === true || obj === false
}
