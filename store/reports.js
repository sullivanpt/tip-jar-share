import { reportStatusOptions } from '~/helpers/reports'
import { formulaMapEnabledValues } from '~/helpers/formulas'
import { populateExampleReport } from '~/helpers/examples'

export const state = () => ({
  reports: []
})

export const getters = {
  // TODO: when dispatch is implemented thosecan return IDs of new items
  lastId(state) {
    return state.reports.length && state.reports.slice(-1)[0].id
  }
}

export const mutations = {
  /**
   * clear any data
   */
  expel(state) {
    state.reports = []
  },
  /**
   * TODO: remove this
   */
  populate(state, { id }) {
    const report = state.reports.find(rpt => id === rpt.id)
    if (!report) return
    const populated = populateExampleReport(report)
    state.reports = state.reports.map(rpt => (id === rpt.id ? populated : rpt))
  },
  /**
   * create a new report for the specified orgaization on the specified day
   * by default status is 'entry'
   * TODO: only manager can create a report that is not yesterday, today, or tomorrow
   */
  create(
    state,
    { organization, formula, date, status = reportStatusOptions[0] }
  ) {
    if (!organization) throw new Error('reports/create organization invalid')
    if (!formula) throw new Error('reports/create formula invalid')
    if (!date) throw new Error('reports/create date invalid')
    // TODO: ensure date is within retention range
    const { id: organizationId } = organization
    if (
      state.reports.find(
        rpt => rpt.organizationId === organizationId && rpt.date === date
      )
    )
      throw new Error('reports/create duplicate date')
    const mapReporterEnables = formulaMapEnabledValues(formula)
    const collections = organization.stations
      .filter(stn => mapReporterEnables[stn.position])
      .map(stn =>
        Object.assign(
          {
            stationId: stn.id,
            allocationId: mapReporterEnables[stn.position].allocationId,
            done: false,
            tipsCash: null
          },
          stn
        )
      )
    let reporterId = 1
    const reporters = organization.members
      .filter(mbr => !mbr.away && mapReporterEnables[mbr.position])
      .map(mbr =>
        Object.assign(
          {
            done: false, // set true here if member has no data to enter
            id: reporterId++,
            memberId: mbr.id,
            name: mbr.name,
            linkedId: mbr.linkedId // can be undefined
          },
          mapReporterEnables[mbr.position]
        )
      )
    state.reports.push({
      id: state.reports.length + 1,
      organizationId,
      date,
      formulaId: formula.id,
      status,
      collections,
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
  collectionUpdate(state, { reportId, id, ...attrs }) {
    const report = state.reports.find(rpt => reportId === rpt.id)
    if (!report) return
    const collection = report.collections.find(col => id === col.id)
    if (!collection) return
    Object.assign(collection, attrs)
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

export const actions = {
  /**
   * create a new report and clone the organization formula
   */
  create({ state, commit, getters, rootGetters }, { organization, ...attrs }) {
    if (!organization) throw new Error('reports/create organization invalid')
    if (!organization.formulaId)
      throw new Error('reports/create formulaId invalid')
    const srcFormula = rootGetters['formulas/allFormulas'].find(
      fml => fml.id === organization.formulaId
    )
    if (!srcFormula) throw new Error('reports/create formula invalid')
    commit('formulas/clone', { organization, srcFormula }, { root: true })
    const formulaId = rootGetters['formulas/lastId']
    const formula = rootGetters['formulas/allFormulas'].find(
      fml => fml.id === formulaId
    )
    commit('create', { organization, formula, ...attrs })
    const report = state.reports.find(rpt => rpt.id === getters.lastId)
    const reportId = report.id
    commit('formulas/update', { id: formulaId, reportId }, { root: true })
    return reportId
  },
  delete({ state, commit }, { id }) {
    const report = state.reports.find(rpt => id === rpt.id)
    if (!report) return
    commit('formulas/delete', { id: report.formulaId }, { root: true })
    commit('delete', { id })
  }
}
