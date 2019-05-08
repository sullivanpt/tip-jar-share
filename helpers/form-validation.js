import { fromCurrency, fromPercent } from '~/helpers/math'

/**
 * return the requested rules
 */
export function rules(options) {
  const r = []
  if (options.required) r.push(v => !!v || 'required')
  if (options.currency) r.push(v => !v || !!fromCurrency(v) || 'not valid')
  if (options.percent || options.percentRange) {
    r.push(v => !v || !!fromPercent(v) || 'not valid')
  }
  if (options.percentRange) {
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
  return r
}
