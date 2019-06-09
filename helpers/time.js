import { DateTime } from 'luxon'

/**
 * extract TZ date in form YYYY-MM-DD from DateTime (already local)
 */
function dateInTz(d) {
  return d.toFormat('yyyy-LL-dd')
}

/**
 * validate date has form YYYY-MM-DD (local) and is a real day of the calendar
 * return DateTime
 */
function asValidDateTimeInTz(s, tz) {
  return DateTime.fromISO(s, { zone: tz })
}

/**
 * convert date of form YYYY-MM-DD (local) to human readable
 */
export function formatDate(s, { timeZone }) {
  const d = asValidDateTimeInTz(s, timeZone)
  if (!d.isValid) return 'Invalid Date'
  return d.toLocaleString({
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * returns dateInTz(asValidDateTimeInTz(s, tz)) or null
 */
export function asValidDateInTz(s, tz) {
  const d = asValidDateTimeInTz(s, tz)
  if (!d.isValid) return null
  const rs = dateInTz(d)
  if (s !== rs) return null // 2019-06-00 becomes valid?!
  return rs
}

/**
 * given date YYYY-MM-DD add or subtract n days to get new date of same form
 * See https://stackoverflow.com/a/1296374
 */
export function addDays(s, tz, days = 1) {
  const d = asValidDateTimeInTz(s, tz).plus({ days })
  if (!d.isValid) return null
  return dateInTz(d)
}

/**
 * determine the current reporting date in the form YYYY-MM-DD
 * based on the start and end of the reporting day.
 */
export function computeLastOpenDate(
  { timeOpen, timeClose, timeZone },
  nowUtc = DateTime.utc()
) {
  const now = nowUtc.setZone(timeZone)
  const anyOpen = DateTime.fromISO(timeOpen, { zone: timeZone })
  const durToOpen = anyOpen.diff(anyOpen.startOf('day'))
  const todayBegan = now.startOf('day')
  const todayOpen = todayBegan.plus(durToOpen)
  const yesterdayOpen = todayOpen.plus({ days: -1 })
  const lastOpen = now > todayOpen ? todayOpen : yesterdayOpen
  return dateInTz(lastOpen)
}
