import { isObject } from '../../helpers/nodash'

/**
 * - flat object
 * - at most 64 keys
 * - keys are strings <= 40 chars (a UUID V4)
 * - values are strings <= 128 chars or null, true, false
 * - exceptions for specific keys
 */
function isFlatShortStrings(obj, noSpecialKeys, stringsOnly) {
  if (!isObject(obj)) return
  const keys = Object.keys(obj)
  if (keys.length > 64) return
  for (const i in keys) {
    const key = keys[i]
    if (typeof key !== 'string') return
    if (key.length > 40) return
    const value = obj[key]
    if (!noSpecialKeys) {
      if (key === 'transfers') return isTransfers(value)
      if (['formulas', 'organizations', 'reports'].includes(key))
        return isHashes(value)
    }
    if (stringsOnly || (value !== null && value !== true && value !== false)) {
      if (typeof value !== 'string') return
      if (value.length > 64) return
    }
  }
  return true
}

/**
 * transfers must be [[{},...], [{}, ...]]
 */
function isTransfers(obj) {
  if (!Array.isArray(obj)) return
  if (!obj.length === 2) return
  for (let i = 0; i < obj.length; i++) {
    if (!Array.isArray(obj[i])) return
    for (let j = 0; j < obj[i].length; j++)
      if (!isFlatShortStrings(obj[i][j], true)) return
  }
  return true
}

/**
 * refresh hash lists must be { '019b60f4-19f8-4b52-8ae7-1eab75feef4b': '1be96ff', ... }
 */
function isHashes(obj) {
  return isFlatShortStrings(obj, true, true)
}

/**
 * middleware enforces shape of req.body and req.query
 */
export function validateQueryAndBody(req, res, next) {
  if (isFlatShortStrings(req.body) && isFlatShortStrings(req.query))
    return next()
  next(new Error('validateQueryAndBody invalid'))
}
