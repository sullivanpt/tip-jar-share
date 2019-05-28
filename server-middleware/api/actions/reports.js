import uuidV4 from 'uuid/v4'
import { resJson, resStatus } from '../connect-helpers'
import { pick } from '../../../helpers/nodash'
import { asValidDateInTz, computeLastOpenDate } from '../../../helpers/time'
import {
  hasOrganizationClose,
  hasOrganizationEdit,
  organizationReadyToReport
} from '../../../helpers/organizations'
import { formulaMapEnabledValues } from '../../../helpers/formulas'
import {
  reportAllDone,
  reportStatusOptions,
  userCanCreateReport
} from '../../../helpers/reports'
import { formulaClone, formulaPublic } from './formulas'
import { models } from './models'

/**
 * return only the public facing fields
 */
export function reportPublic(report) {
  return pick(report, [
    'id',
    'organizationId',
    'date',
    'formulaId',
    'status',
    'collections', // WARNING: this is a deep object
    'reporters' // WARNING: this is a deep object
  ])
}

/**
 * route handler to create a report
 */
export function reportCreate(req, res, next) {
  const { organizationId } = req.body
  const organization = models.organizations.find(
    org => !org.deleted && org.id === organizationId
  )
  if (!organization) return next() // will 404
  if (!organizationReadyToReport(organization)) return resStatus(res, 400)
  const lastOpenDate = computeLastOpenDate(organization)
  const date = asValidDateInTz(req.body.date)
  if (!date) return resStatus(res, 400)
  if (
    !userCanCreateReport(
      hasOrganizationEdit(req.me.id, organization),
      lastOpenDate,
      date
    )
  )
    return resStatus(res, 403)
  if (models.reports.find(rpt => !rpt.deleted && rpt.date === date))
    return resStatus(res, 409)

  const srcFormula = models.formulas.find(
    fml => !fml.deleted && fml.id === organization.formulaId
  )
  if (!srcFormula) return next(new Error('organization.formulaId invalid'))

  const reportData = reportCreateInternal(organization, srcFormula, date)
  resJson(res, {
    formulas: [formulaPublic(reportData.formula)],
    reports: [reportPublic(reportData.report)],
    lastId: reportData.report.id
  })
}

/**
 * second half of reportCreate. skip all validation
 */
export function reportCreateInternal(organization, srcFormula, date) {
  const formula = formulaClone(srcFormula, organization.id)

  const mapReporterEnables = formulaMapEnabledValues(formula)
  const collections = organization.stations
    .filter(stn => mapReporterEnables[stn.position])
    .map(stn => ({
      id: uuidV4(),
      stationId: stn.id,
      allocationId: mapReporterEnables[stn.position].allocationId,
      position: stn.position,
      name: stn.name,
      done: false,
      tipsCash: null
    }))
  const reporters = organization.members
    .filter(mbr => !mbr.away && mapReporterEnables[mbr.position])
    .map(mbr =>
      Object.assign(
        {
          id: uuidV4(),
          memberId: mbr.id,
          name: mbr.name,
          linkedId: mbr.linkedId, // can be null
          done: false // set true here if member has no data to enter
        },
        mapReporterEnables[mbr.position] // allocationId, position, tipsCash, ...
      )
    )
  const orphans =
    collections.length !== organization.stations.length ||
    reporters.length !==
      organization.members.filter(mbr => !mbr.away && mbr.position).length

  const report = {
    id: uuidV4(),
    organizationId: organization.id,
    date,
    formulaId: formula.id,
    status: reportStatusOptions[0],
    orphans,
    collections,
    reporters
  }
  models.reports.push(report)

  formula.reportId = report.id // will have to update after report is persisted

  return { formula, report }
}

/**
 * route handler to update a report
 */
export function reportUpdate(req, res, next) {
  const report = models.reports.find(
    rpt => !rpt.deleted && rpt.id === req.body.reportId
  )
  if (!report) return next() // will 404
  const organization = models.organizations.find(
    org => !org.deleted && org.id === report.organizationId
  )
  if (!organization) return next(new Error('report.organizationId invalid'))
  if (!hasOrganizationClose(req.me.id, organization)) return resStatus(res, 403)
  const { status } = req.body
  if (status) {
    if (!reportStatusOptions.includes(status)) return resStatus(res, 400)
    if (status === 'closed' && !reportAllDone(report))
      return resStatus(res, 400)
    report.status = status
  }
  resJson(res, { reports: [reportPublic(report)], lastId: report.id })
}

/**
 * route handler to delete a report and its formula
 */
export function reportDelete(req, res, next) {
  const report = models.reports.find(
    rpt => !rpt.deleted && rpt.id === req.body.reportId
  )
  if (!report) return next() // will 404
  const organization = models.organizations.find(
    org => !org.deleted && org.id === report.organizationId
  )
  if (!organization) return next(new Error('report.organizationId invalid'))
  if (!hasOrganizationEdit(req.me.id, organization)) return resStatus(res, 403)
  const deleted = Date.now()
  if (report.formulaId) {
    models.formulas.forEach(fml => {
      if (fml.id === report.formulaId) fml.deleted = deleted
    })
  }
  report.deleted = deleted
  resStatus(res, 204)
}
