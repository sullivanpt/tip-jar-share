/**
 * extract TZ date in form YYYY-MM-DD from Date
 * TODO: use organization.timeZone, especially server side
 */
export function dateInTz(date = new Date()) {
  const year = date.getFullYear()
  const month = ('0' + (date.getMonth() + 1)).slice(-2)
  const dom = ('0' + date.getDate()).slice(-2)
  return `${year}-${month}-${dom}`
}

/**
 * validate date has form YYYY-MM-DD and is a real day of the calendar
 * return Date if it is, else undefined
 */
export function asValidDate(s) {
  try {
    const d = new Date(s)
    if (isNaN(d)) return
    // TODO: not sure why this is needed
    // adjust the time to pretend it is UTC
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset())
    return d
  } catch (e) {
    // ignore error, return undefined
  }
}

/**
 * convert date of form YYYY-MM-DD to human readable
 */
export function formatDate(s) {
  const d = asValidDate(s)
  return d.toLocaleDateString('default', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * returns dateInTz(asValidDate(s)) or undefined
 */
export function asValidDateInTz(s) {
  const validated = asValidDate(s)
  if (!validated) return
  return dateInTz(validated)
}

/**
 * given date YYYY-MM-DD add or subtract n days to get new date of same form
 * See https://stackoverflow.com/a/1296374
 */
export function addDays(date, n = 1) {
  const d = asValidDate(date)
  d.setDate(d.getDate() + n)
  return dateInTz(d)
}

/**
 * convert 24 hour time in form HH:MM to millis
 */
function timeToMs(timeStr) {
  const [, hours, minutes] = /(\d{2}):(\d{2})/.exec(timeStr)
  const hoursAsMinutes = 60 * parseInt(hours)
  const ms = (hoursAsMinutes + parseInt(minutes)) * 60 * 1000
  return ms
}

/**
 * number of ms in one minute, one day
 */
const msPerMinute = 1000 * 60
const msPerDay = 1000 * 60 * 60 * 24

/**
 * helper to clip to nearest day in UTC
 * From https://stackoverflow.com/a/10789415
 */
function clipMsToUtcDay(timeMs) {
  return Math.floor(timeMs / msPerDay) * msPerDay
}

/**
 * TODO: accept timeZone as an argument
 */
function addTzMs(timeMs) {
  const tzOffset = new Date().getTimezoneOffset()
  return timeMs + tzOffset * msPerMinute
}

/**
 * given time in ms add or subtract n days
 */
function addDaysMs(time, n = 1) {
  return time + n * msPerDay
}

/**
 * determine the current reporting date in the form YYYY-MM-DD
 * based on the start and end of the reporting day.
 * TODO: use organization.timeZone, especially server side
 */
export function computeLastOpenDate(
  { timeOpen, timeClose, timeZone },
  nowMs = Date.now()
) {
  const todayBeganMs = addTzMs(clipMsToUtcDay(nowMs), timeZone)
  const todayOpenMs = todayBeganMs + timeToMs(timeOpen)
  const lastOpenMs =
    nowMs >= todayOpenMs ? todayOpenMs : addDaysMs(todayOpenMs, -1)
  return dateInTz(new Date(lastOpenMs))
}
