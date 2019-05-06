import { reportStatusOptions } from '~/helpers/reports'
import { hasOrganizationEdit } from '~/helpers/organizations'

// const sampleNewReport = {
//   id: 1,
//   organizationId: 123,
//   date: '2012-03-27',
//   status: reportStatusOptions[0],
//   rule: { ... }, // from organizations.rule when report created
//   // built from organizations[].members when report created but drifts afterwards
//   reporters: [
//     {
//       id: 1, // reports[].reporters unique index
//       memberId: 1, // source organizations[].members unique index if any
//       position: 'server', // display only, rule is used
//       rule: 'in/out:server-pool in:bar-pool', // rule from position, i.e. organization.positions[organization.members[].position].rule
//       name: 'Jennie Brown',
//       linkedId: 3,
//       done: false, // becomes true when values are supplied
//       reported: {} // reported values, vary by rule
//     }
//   ]
// }

export const state = () => ({
  reports: []
})

export const getters = {
  /**
   * return all reports across all my organizations that need manager action by me
   */
  needsEditMe(state, getters, rootState) {
    const meId = rootState.me.id
    if (!meId) return []
    const organizationsIdMeEdit = rootState.organizations.organizations
      .filter(org => hasOrganizationEdit(meId, org))
      .map(org => org.id)
    return state.reports.filter(
      rpt =>
        rpt.status !== 'closed' &&
        organizationsIdMeEdit.includes(rpt.organizationId)
    )
  },
  /**
   * return all reports across all my organizations that need my action because I have edit
   */
  needsEntryEditMe(state, getters) {
    return getters.needsEditMe.filter(
      rpt =>
        rpt.status === 'entry' &&
        rpt.reporters.find(rptr => !rptr.done && !rptr.linkedId)
    )
  },
  /**
   * return all reports across all my organizations that need some action
   */
  needsEntry(state) {
    return state.reports.filter(
      rpt => rpt.status === 'entry' && rpt.reporters.find(rptr => !rptr.done)
    )
  },
  /**
   * return all reports across all my organizations that need my action
   */
  needsEntryMe(state, getters, rootState) {
    const meId = rootState.me.id
    if (!meId) return []
    return getters.needsEntry.filter(rpt =>
      rpt.reporters.find(rptr => rptr.linkedId === meId)
    )
  }
}

export const mutations = {
  /**
   * create a new report for the specified orgaization on the specified day
   * by default status is 'entry'
   * TODO: only manager can create a report that is not yesterday, today, or tomorrow
   */
  create(state, { organization, date, status = reportStatusOptions[0] }) {
    if (!organization) throw new Error('reports/create organization invalid')
    if (!date) throw new Error('reports/create date invalid')
    // TODO: ensure date is within retention range
    const { id: organizationId } = organization
    if (
      state.reports.find(
        rpt => rpt.organizationId === organizationId && rpt.date === date
      )
    )
      throw new Error('reports/create duplicate date')
    const mapPositionToRule = organization.positions.reduce((acc, pos) => {
      if (pos.name && pos.rule) acc[pos.name] = pos.rule // ignore duplicates
      return acc
    }, {})
    let reporterId = 1
    const reporters = organization.members
      .filter(mbr => !mbr.away && mapPositionToRule[mbr.position])
      .map(mbr => ({
        done: false, // set true here if member has no data to enter
        reported: {},
        id: reporterId++,
        memberId: mbr.id,
        position: mbr.position,
        rule: mapPositionToRule[mbr.position],
        name: mbr.name,
        linkedId: mbr.linkedId // can be undefined
      }))
    state.reports.push({
      id: state.reports.length + 1,
      organizationId,
      date,
      rule: Object.assign({}, organization.rule), // shallow copy
      status,
      reporters
    })
  },
  update(state, { id, ...attrs }) {
    const report = state.reports.find(rpt => id === rpt.id)
    if (!report) return
    Object.assign(report, attrs)
  },
  delete(state, { id }) {
    state.reports = state.reports.filter(rpt => id !== rpt.id)
  },
  reporterUpdate(state, { reportId, id, ...attrs }) {
    const report = state.reports.find(rpt => reportId === rpt.id)
    if (!report) return
    const reporter = report.reporters.find(rptr => id === rptr.id)
    if (!reporter) return
    Object.assign(reporter, attrs)
    // TODO: when unlink from organization make sure report and organization access is removed
  }
}
