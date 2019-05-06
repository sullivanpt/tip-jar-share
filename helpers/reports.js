import { addDays } from '~/helpers/time'

export const reportStatusOptions = ['entry', 'review', 'closed']

export function reportsFilterByOrganizationId(store, organizationId) {
  return store.state.reports.reports.filter(
    rpt => organizationId.toString() === rpt.organizationId.toString()
  )
}

export function reportFindById(store, reportId) {
  return store.state.reports.reports.find(
    rpt => reportId.toString() === rpt.id.toString()
  )
}

export function reportFindByOrganizationAndDate(store, organizationId, date) {
  return store.state.reports.reports.find(
    rpt =>
      organizationId.toString() === rpt.organizationId.toString() &&
      rpt.date === date
  )
}

/**
 * waiting on input for the specified linked user
 */
export function reportNeedsEntryUserId(userId, report) {
  const reporter = report.reporters.find(rptr => rptr.linkedId === userId)
  return report.status === 'entry' && reporter && !reporter.done
}

/**
 * report needs user with edit access
 */
export function reportNeedsEdit(report) {
  return report.status !== 'closed'
}

/**
 * TODO: set this limit dynamically based on organization.retention
 * note: we allow tomorrow, maybe we should not?
 */
export function reportDateWithinRetention(lastOpenDate, retention = 90) {
  return {
    minDate: addDays(lastOpenDate, -retention),
    maxDate: addDays(lastOpenDate, 1)
  }
}

/**
 * determine if userId has permission to create a report for given date.
 * assumes report does not already exist.
 * rules:
 * - any member can create a report for yesterday and today (assumes user is member)
 * - only edit access can create a report for other days
 * - no future reports before tomorrow
 * date has for YYYY-MM-DD
 * note: duplicates logic in currentReportDates
 */
export function userCanCreateReport(hasOrganizationEdit, lastOpenDate, date) {
  const retention = reportDateWithinRetention(lastOpenDate)
  if (date > retention.maxDate) return false
  if (hasOrganizationEdit) return date >= retention.minDate
  const minDate = addDays(lastOpenDate, -1)
  return date >= minDate
}

/**
 * return today and yesterday according to open hours
 * note: duplicates logic in userCanCreateReport
 */
export function currentReportDates(lastOpenDate) {
  return [addDays(lastOpenDate, -1), lastOpenDate]
}
