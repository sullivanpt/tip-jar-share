import { buildGravatarUrl } from '~/helpers/gravatar'
import { fromCurrency, fromHours, fromPercent } from '~/helpers/math'

/**
 * return the requested rules
 */
export function rules(options) {
  const r = []
  if (options.required) r.push(v => !!v || 'required')
  if (options.gravatar) {
    r.push(v => !v || !!buildGravatarUrl(v) || 'not valid')
  }
  if (options.unique) {
    r.push(v => !v || !options.unique.includes(v) || 'already in use')
  }
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
 * typing saver to make Vue this look like nuxt context
 */
export function vmAsCtx(vm) {
  return {
    params: vm.$route.params,
    query: vm.$route.query,
    store: vm.$store
  }
}

/**
 * extract form from object
 * return modified dst for convenience
 */
export function formUpdate(dst, src) {
  Object.keys(dst).forEach(key => {
    if (src) dst[key] = src[key]
  })
  return dst
}

/**
 * returns true if shallow compare of keys in dst are same as same keys in src
 * keys in skip are ignored
 */
export function formUnchanged(dst, src, skip = []) {
  if (!src) return false
  return !Object.keys(dst).find(
    key => !skip.includes(key) && dst[key] !== src[key]
  )
}
