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

/**
 * add src to dst, removing duplicates detected by eq
 */
export function replaceIn(dst, src, eq) {
  const used = {}
  const r = dst.map(d => {
    const si = src.findIndex(s => eq(d, s))
    if (si === -1) return d
    used[src[si].id] = true
    // need to mutate as existing pages aren't correctly reactive (they cache objects)
    return Object.assign(d, src[si])
  })
  for (let si = 0; si < src.length; si++) {
    if (!used[src[si].id]) r.push(src[si])
  }
  return r
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

export function isUnset(obj) {
  return typeof obj === 'undefined' || obj === null
}

export function isString(obj) {
  return typeof obj === 'string'
}

export function isObject(obj) {
  return typeof obj === 'object'
}

export function coerceBoolean(obj, fallback = false) {
  if (obj === false || obj === true) return obj
  return fallback
}

export function isBoolean(obj) {
  return obj === true || obj === false
}
