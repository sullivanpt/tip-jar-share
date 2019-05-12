/**
 * - flat object
 * - at most 64 keys
 * - keys are strings <= 32 chars
 * - values are strings <= 128 chars or null
 */
function isFlatShortStrings(obj) {
  // see https://stackoverflow.com/a/22482737
  if (obj !== Object(obj)) return
  const keys = Object.keys(obj)
  if (keys.length > 64) return
  for (const i in keys) {
    const key = keys[i]
    if (typeof key !== 'string') return
    if (key.length > 32) return
    const value = obj[key]
    if (value !== null) {
      if (typeof value !== 'string') return
      if (value.length > 64) return
    }
  }
  return true
}

/**
 * middleware enforces shape of req.body and req.query
 */
export function validateQueryAndBody(req, res, next) {
  if (isFlatShortStrings(req.body) && isFlatShortStrings(req.query))
    return next()
  next(new Error('validateQueryAndBody invalid'))
}
