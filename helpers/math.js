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
 * if c and d is null return null
 * promote:any [default] -- if only one is null promote both to at least 0
 * promote:both -- always promote both to at least 0
 * promote:c -- if d is null return null
 * promote:d -- if c is null return null
 * promote:none -- if c or d is null return null
 * return c[op](d)
 */
export function opOrNull(c, op, d, promote = 'any') {
  if (promote === 'any') {
    if (!c && !d) return null
  } else if (promote === 'none') {
    if (!c || !d) return null
  } else if (promote === 'c') {
    if (!d) return null
  } else if (promote === 'd') {
    if (!c) return null
  } // else promote === 'both'
  if (!c) c = new Big(0)
  if (!d) d = new Big(0)
  return c[op](d)
}

/**
 * return null if dividing by b will throw an exception
 */
export function canDivide(b) {
  if (!b || b.eq(0)) return null
  return b
}

/**
 * convert Big or null to string of maximum precision
 */
export function serialize(b) {
  if (!b) return null
  return b.toString()
}

/**
 * test if string Big is null, '', or 0
 */
export function isZero(s) {
  const b = toBigOrNull(s)
  return !b || b.eq(0)
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
 * accumulate one column identified by key of currency values in supplied array
 */
export function totalCurrency(arr, key, base = fromCurrency('0')) {
  return toCurrency(
    arr.reduce((acc, obj) => {
      if (obj[key]) acc = acc.plus(fromCurrency(obj[key]))
      return acc
    }, base)
  )
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
 * number of fraction digits for hours
 */
const fractionHours = 3

/**
 * convert big or null to hours with decimal fraction (0.000), or empty string
 */
export function toHours(b) {
  if (!b) return ''
  return b.toFixed(fractionHours)
}

/**
 * opposite of toHours
 */
export function fromHours(s) {
  return toBigOrNull(s)
}

/**
 * accumulate one column identified by key of hour values in supplied array
 */
export function totalHours(arr, key, base = fromHours('0')) {
  return toHours(
    arr.reduce((acc, obj) => {
      if (obj[key]) acc = acc.plus(fromHours(obj[key]))
      return acc
    }, base)
  )
}

/**
 * format percent for display, input can be null, string or Big
 * when null or '', returns ''
 */
export function formatHours(sOrB) {
  if (sOrB === null || sOrB === '') return ''
  const n = +sOrB
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionHours,
    maximumFractionDigits: fractionHours
  }).format(n)
}

/**
 * returns { hours, minutes } as strings
 */
export function toHoursAndMinutes(b) {
  if (!b) return { hours: '0', minutes: '0' }
  let base = b.round(0, 0)
  const frac = b.minus(base)
  const bminutes = frac.times(60)
  let minutes = bminutes.toFixed(0)
  if (minutes === '60') {
    minutes = '0'
    base = base.plus(1)
  }
  const hours = base.toFixed(0)
  return { hours, minutes }
}

/**
 * return a string "X hours and Y minutes"
 */
export function formatHoursAndMinutes(s) {
  const hm = toHoursAndMinutes(fromHours(s))
  const hoursLabel = hm.hours === '1' ? 'hour' : 'hours'
  const minutesLabel = hm.minutes === '1' ? 'minute' : 'minutes'
  return `${hm.hours} ${hoursLabel} and ${hm.minutes} ${minutesLabel}`
}

/**
 * number of fraction digits for percent
 */
const fractionPercent = 1

/**
 * convert big or null to a percentage (000.0%), or empty string
 */
export function toPercent(b) {
  if (!b) return ''
  return b.times(100).toFixed(fractionPercent)
}

/**
 * opposite of toPercent
 */
export function fromPercent(s) {
  const b = toBigOrNull(s)
  if (!b) return null
  return b.div(100)
}

/**
 * accumulate one column identified by key of percent values in supplied array
 */
export function totalPercent(arr, key, base = fromPercent('0')) {
  return toPercent(
    arr.reduce((acc, obj) => {
      if (obj[key]) acc = acc.plus(fromPercent(obj[key]))
      return acc
    }, base)
  )
}

/**
 * 100% + self - total
 */
export function remainPercent(
  total = fromPercent('0'),
  self = fromPercent('0')
) {
  const limit = fromPercent('100').plus(self)
  if (limit.lte(total)) return new Big('0')
  return limit.sub(total)
}

/**
 * format percent for display, input can be null, string or Big
 * when null or '', returns ''
 */
export function formatPercent(sOrB) {
  if (sOrB === null || sOrB === '') return ''
  if (typeof sOrB !== 'string') sOrB = toPercent(sOrB) // move decimal
  const n = +sOrB
  return (
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: fractionPercent,
      maximumFractionDigits: fractionPercent
    }).format(n) + '%'
  )
}
