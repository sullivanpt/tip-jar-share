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
import * as connectors from '../connectors'
import { formulaClone, formulaPublic } from './formulas'

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
    'orphans',
    'collections', // WARNING: this is a deep object
    'reporters' // WARNING: this is a deep object
  ])
}

/**
 * route handler to create a report
 */
export async function reportCreate(req, res, next) {
  const { organizationId } = req.body
  const organization = await connectors.organizations.findOneByOrganizationId(
    organizationId
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
  if (
    await connectors.reports.findOneByOrganizationIdAndDate(
      organization.id,
      date
    )
  )
    return resStatus(res, 409)

  const srcFormula = await connectors.formulas.findOneByFormulaId(
    organization.formulaId
  )
  if (!srcFormula) throw new Error('organization.formulaId invalid')

  const reportData = await reportCreateInternal(organization, srcFormula, date)
  resJson(res, {
    formulas: [formulaPublic(reportData.formula)],
    reports: [reportPublic(reportData.report)],
    lastId: reportData.report.id
  })
}

/**
 * second half of reportCreate. skip all validation
 */
export async function reportCreateInternal(organization, srcFormula, date) {
  const reportId = uuidV4()
  const formula = formulaClone(srcFormula, organization.id, reportId)

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
    id: reportId,
    organizationId: organization.id,
    date,
    formulaId: formula.id,
    status: reportStatusOptions[0],
    orphans,
    collections,
    reporters
  }
  await connectors.createReportAndFormula(report, formula)

  return { formula, report }
}

/**
 * route handler to update a report
 */
export async function reportUpdate(req, res, next) {
  const report = await connectors.reports.findOneByReportId(req.body.reportId)
  if (!report) return next() // will 404
  const organization = await connectors.organizations.findOneByOrganizationId(
    report.organizationId
  )
  if (!organization) throw new Error('report.organizationId invalid')
  if (!hasOrganizationClose(req.me.id, organization)) return resStatus(res, 403)
  const { status } = req.body
  if (status) {
    if (!reportStatusOptions.includes(status)) return resStatus(res, 400)
    if (status === 'closed' && !reportAllDone(report))
      return resStatus(res, 400)
    report.status = status
  }
  await connectors.reports.updateOne(report)
  resJson(res, { reports: [reportPublic(report)], lastId: report.id })
}

/**
 * route handler to delete a report and its formula
 */
export async function reportDelete(req, res, next) {
  const report = await connectors.reports.findOneByReportId(req.body.reportId)
  if (!report) return next() // will 404
  const organization = await connectors.organizations.findOneByOrganizationId(
    report.organizationId
  )
  if (!organization) throw new Error('report.organizationId invalid')
  if (!hasOrganizationEdit(req.me.id, organization)) return resStatus(res, 403)

  // FUTURE: connectors.deleteReportAndFormula
  const deleted = Date.now()
  if (report.formulaId) {
    const formula = await connectors.formulas.findOneByFormulaId(
      report.formulaId
    )
    if (!formula) throw new Error('report.formulaId invalid')
    formula.deleted = deleted
    await connectors.formulas.updateOne(formula)
  }
  report.deleted = deleted
  await connectors.reports.updateOne(report)

  resStatus(res, 204)
}
