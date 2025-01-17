// const sampleNewReport = {
//   id: 1,
//   organizationId: 123,
//   date: '2012-03-27',
//   formulaId: 'frm-123, // cloned from organizations.formulaId when report created
//   status: reportStatusOptions[0],
//   orphans: false, // true if position not found for any station or any member with position that is not away
//   collections: [ // cloned from organizations[].stations
//     {
//       id: // unique ID of this station within a report
//       stationId: 1, // source organizations[].stations[].id
//       allocationId: 1, // source formulas[].allocations[].id
//       position: // name of formula position to apply to funds from this station
//       name: // name of this station (ideally unique within report)
//       done: false,
//       tipsCash: "123.45" // all amounts are serialized as strings
//     }
//   ]
//   // built from organizations[].members when report created but drifts afterwards
//   reporters: [
//     {
//       id: 1, // reports[].reporters unique index
//       memberId: 1, // source organizations[].members[].id
//       allocationId: 1, // source formulas[].allocations[].id
//       position: 'server', // display only
//       name: 'Jennie Brown',
//       linkedId: 3,
//       done: false, // becomes true when values are supplied
//       tipsCashShow: true, // copied from formulas[organizations[].formulaId].allocations[position] when created
//       tipsCash: "123.45" // all amounts are serialized as strings
//       ...
//     }
//   ]
// }

import { addDays } from '../helpers/time'

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

export function reportGetVersion(report) {
  return report.hash
}

/**
 * waiting on input for the specified linked user
 */
export function reportNeedsEntryUserId(userId, report) {
  const reporter = report.reporters.find(rptr => rptr.linkedId === userId)
  return report.status === 'entry' && reporter && !reporter.done
}

/**
 * true if all collections and either not entry or all reporters done
 * (not entry case for reporters who did not work today)
 */
export function reportAllDone(report) {
  if (report.collections.find(col => !col.done)) return false
  if (report.status !== 'entry') return true
  if (report.reporters.find(rptr => !rptr.done)) return false
  return true
}
/**
 * report needs user with edit access
 */
export function reportNeedsEdit(report) {
  return report.status !== 'closed'
}

/**
 * is specific reporter me
 */
export function reporterIsMe(meId, reporter) {
  return reporter.linkedId === meId
}

/**
 * TODO: set this limit dynamically based on organization.retention
 * note: we allow tomorrow, maybe we should not?
 */
export function reportDateWithinRetention(
  { timeZone, retention = 90 },
  lastOpenDate
) {
  return {
    minDate: addDays(lastOpenDate, timeZone, -retention),
    maxDate: addDays(lastOpenDate, timeZone, 1)
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
export function userCanCreateReport(
  organization,
  hasOrganizationEdit,
  lastOpenDate,
  date
) {
  const retention = reportDateWithinRetention(organization, lastOpenDate)
  if (date > retention.maxDate) return false
  if (hasOrganizationEdit) return date >= retention.minDate
  const minDate = addDays(lastOpenDate, organization.timeZone, -1)
  return date >= minDate
}

/**
 * return today and yesterday according to open hours
 * note: duplicates logic in userCanCreateReport
 */
export function currentReportDates({ timeZone }, lastOpenDate) {
  return [addDays(lastOpenDate, timeZone, -1), lastOpenDate]
}
