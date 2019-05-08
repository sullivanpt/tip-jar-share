import { fromCurrency, fromHours, fromPercent } from '~/helpers/math'

/**
 * return the requested rules
 */
export function rules(options) {
  const r = []
  if (options.required) r.push(v => !!v || 'required')
  if (options.currency) {
    r.push(v => !v || !!fromCurrency(v) || 'not valid')
    r.push(
      v =>
        fromCurrency(v) === null ||
        fromCurrency(v).gte(0) ||
        'must be at least 0'
    )
  }
  if (options.percent) {
    r.push(v => !v || !!fromPercent(v) || 'not valid')
    r.push(
      v =>
        fromPercent(v) === null || fromPercent(v).gte(0) || 'must be at least 0'
    )
    r.push(
      v =>
        fromPercent(v) === null ||
        fromPercent(v).lte(1) ||
        'must be at most 100'
    )
  }
  if (options.hours) {
    r.push(v => !v || !!fromHours(v) || 'not valid')
    r.push(
      v => fromHours(v) === null || fromHours(v).gte(0) || 'must be at least 0'
    )
    r.push(
      v => fromHours(v) === null || fromHours(v).lte(24) || 'must be at most 24'
    )
  }
  return r
}

/**
 * returns true if shallow compare of keys in dst are same as same keys in src
 */
export function formUnchanged(dst, src) {
  return !Object.keys(dst).find(key => dst[key] !== src[key])
}
