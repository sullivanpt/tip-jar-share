import uuidV4 from 'uuid/v4'
import { resJson, resStatus } from '../connect-helpers'
import { pick } from '../../../helpers/nodash'
import { asValidDate, computeLastOpenDate } from '../../../helpers/time'
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
import { formulaClone } from './formulas'
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
    org => !org.deleted && org.id === req.query.organizationId
  )
  if (!organization) return next() // will 404
  if (!organizationReadyToReport(organization)) return resStatus(req, 400)
  const lastOpenDate = computeLastOpenDate(organization)
  const date = asValidDate(req.body.date)
  if (!date) return resStatus(req, 400)
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
  const report = {
    id: uuidV4(),
    organizationId,
    date,
    formulaId: formula.id,
    status: reportStatusOptions[0],
    collections,
    reporters
  }
  models.reports.push(report)

  formula.reportId = report.id // will have to update after report is persisted

  resJson(res, reportPublic(report))
}

/**
 * route handler to update a report
 */
export function reportUpdate(req, res, next) {
  const report = models.reports.find(
    rpt => !rpt.deleted && rpt.id === req.query.reportId
  )
  if (!report) return next() // will 404
  const organization = models.organizations.find(
    org => !org.deleted && org.id === report.organizationId
  )
  if (!organization) return next(new Error('report.organizationId invalid'))
  if (!hasOrganizationClose(req.me.id, organization)) return resStatus(req, 403)
  const { status } = req.body
  if (status) {
    if (!reportStatusOptions.includes(status)) return resStatus(res, 400)
    if (status === 'closed' && !reportAllDone(report))
      return resStatus(res, 400)
    report.status = status
  }
  resJson(res, reportPublic(report))
}

/**
 * route handler to delete a report and its formula
 */
export function reportDelete(req, res, next) {
  const report = models.reports.find(
    rpt => !rpt.deleted && rpt.id === req.query.reportId
  )
  if (!report) return next() // will 404
  const organization = models.organizations.find(
    org => !org.deleted && org.id === report.organizationId
  )
  if (!organization) return next(new Error('report.organizationId invalid'))
  if (!hasOrganizationEdit(req.me.id, organization)) return resStatus(req, 403)
  const deleted = Date.now()
  if (report.formulaId) {
    models.formulas.forEach(fml => {
      if (fml.id === report.formulaId) fml.deleted = deleted
    })
  }
  report.deleted = deleted
  resStatus(req, 204)
}
