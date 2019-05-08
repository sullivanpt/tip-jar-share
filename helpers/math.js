import Big from 'big.js'
// expose https://github.com/MikeMcl/big.js
export { Big }

/**
 * convert string or null to a Big or null
 */
export function toBigOrNull(s) {
  if (!s) return null
  try {
    return new Big(s)
  } catch (e) {
    return null
  }
}

/**
 * convert Big or null to string of maximum precision
 */
export function serialize(b) {
  if (!b) return null
  return b.toString()
}

/**
 * convert big or null to a decimal with cents (0.00), or empty string
 * TODO: locale formatting
 */
export function toCurrency(b) {
  if (!b) return ''
  return b.toFixed(2)
}

/**
 * opposite of toCurrency
 * TODO: remove locale formatting
 */
export function fromCurrency(s) {
  return toBigOrNull(s)
}

/**
 * format currency for display, input can be null, string or Big
 * when null or '', returns ''
 */
export function formatCurrency(sOrB) {
  if (sOrB === null || sOrB === '') return ''
  const n = +sOrB
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(n)
}

/**
 * convert big or null to hours with decimal fraction (0.000), or empty string
 */
export function toHours(b) {
  if (!b) return ''
  return b.toFixed(3)
}

/**
 * opposite of toHours
 */
export function fromHours(s) {
  return toBigOrNull(s)
}

/**
 * convert big or null to a percentage (000.0%), or empty string
 */
export function toPercent(b) {
  if (!b) return ''
  return b.times(100).toFixed(1)
}

/**
 * opposite of toPercent
 */
export function fromPercent(s) {
  const b = toBigOrNull(s)
  if (!b) return null
  return b.div(100)
}
