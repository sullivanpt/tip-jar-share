function hasOrganizationEdit(userId, organization) {
  return organization.members.find(mbr => mbr.edit && mbr.linkedId === userId)
}

const reportStatusOptions = ['new', 'entry', 'review', 'closed']

// const sampleNewReport = {
//   organizationId: 123,
//   date: '2012-03-27',
//   status: reportStatusOptions[0],
//   rule: { ... }, // from organizations.rule when report created
//   // built from organizations[].members when report created but drifts afterwards
//   members: [
//     {
//       id: 1, // reports[].members unique index
//       organizationMemberId: 1, // source organizations[].members unique index if any
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
        rpt.members.find(mbr => !mbr.done && !mbr.linkedId)
    )
  },
  /**
   * return all reports across all my organizations that need some action
   */
  needsEntry(state) {
    return state.reports.filter(
      rpt => rpt.status === 'entry' && rpt.members.find(mbr => !mbr.done)
    )
  },
  /**
   * return all reports across all my organizations that need my action
   */
  needsEntryMe(state, getters, rootState) {
    const meId = rootState.me.id
    if (!meId) return []
    return getters.needsEntry.filter(rpt =>
      rpt.members.find(mbr => mbr.linkedId === meId)
    )
  }
}

export const mutations = {
  /**
   * create a new report for the specified orgaization on the specified day
   * TODO: only manager can create a report that is not yesterday, today, or tomorrow
   */
  create(state, { organization, date }) {
    if (!organization) throw new Error('reports/create organization invalid')
    if (!date) throw new Error('reports/create date invalid')
    const { organizationId } = organization
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
    let memberId = 1
    const members = organization.members
      .filter(mbr => !mbr.away && mapPositionToRule[mbr.position])
      .map(mbr => ({
        done: false,
        reported: {},
        id: memberId++,
        organizationMemberId: mbr.id,
        position: mbr.position,
        rule: mapPositionToRule[mbr.position],
        name: mbr.name,
        linkedId: mbr.linkedId // can be undefined
      }))
    state.reports.push({
      organizationId,
      date,
      rule: Object.assign({}, organization.rule), // shallow copy
      status: reportStatusOptions[0], // 'new'
      members
    })
  }
  // TODO: createMissing() -- create yesterday and today if needed and advance status to 'entry'
  // TODO: update, delete, entry, ...
}