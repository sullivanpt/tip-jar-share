import uuidV4 from 'uuid/v4'
import { resJson, resStatus } from '../connect-helpers'
import {
  formulaMapEnabledValues,
  reporterFields
} from '../../../helpers/formulas'
import { hasOrganizationClose } from '../../../helpers/organizations'
import { reporterIsMe } from '../../../helpers/reports'
import * as connectors from '../connectors'
import { reportPublic } from './reports'

/**
 * route handler to create a new reporter in a report
 * this is typically used for temporary workers that are not members
 * and when one member works more than one position
 */
export async function reportReporterCreate(req, res, next) {
  const report = await connectors.reports.findOneByReportId(req.body.reportId)
  if (!report) return next() // will 404
  if (report.status === 'closed') return resStatus(res, 403)
  const organization = await connectors.organizations.findOneByOrganizationId(
    report.organizationId
  )
  if (!organization) throw new Error('report.organizationId invalid')
  if (!hasOrganizationClose(req.me.id, organization)) return resStatus(res, 403)
  const formula = await connectors.formulas.findOneByFormulaId(report.formulaId)
  if (!formula) throw new Error('report.formulaId invalid')

  const { name, position } = req.body
  if (!name || !position) return resStatus(res, 400)
  const mapReporterEnables = formulaMapEnabledValues(formula)
  if (!mapReporterEnables[position]) return resStatus(res, 400)
  const reporter = Object.assign(
    {
      // TODO: members create reporters with different positions and same memberId, linkedId
      id: uuidV4(),
      memberId: null,
      name,
      linkedId: null,
      done: false // set true here if member has no data to enter
    },
    mapReporterEnables[position] // allocationId, position, tipsCash, ...
  )
  report.reporters.push(reporter)
  await connectors.reports.updateOne(report)

  resJson(res, {
    reports: [reportPublic(report)],
    lastId: reporter.id
  })
}

/**
 * route handler to update a reporter in a report
 */
export async function reportReporterUpdate(req, res, next) {
  const report = await connectors.reports.findOneByReportId(req.body.reportId)
  if (!report) return next() // will 404
  if (report.status === 'closed') return resStatus(res, 403)

  const reporter = report.reporters.find(
    rptr => rptr.id === req.body.reporterId
  )
  if (!reporter) return next() // will 404
  if (!reporterIsMe(req.me.id, reporter)) {
    const organization = await connectors.organizations.findOneByOrganizationId(
      report.organizationId
    )
    if (!organization) throw new Error('report.organizationId invalid')
    if (!hasOrganizationClose(req.me.id, organization))
      return resStatus(res, 403)
  }

  const { hours, salesTotal, salesExcluded, tipsPos, tipsCash } = req.body
  if (hours !== undefined) reporter.hours = hours || null
  if (salesTotal !== undefined) reporter.salesTotal = salesTotal || null
  if (salesExcluded !== undefined)
    reporter.salesExcluded = salesExcluded || null
  if (tipsPos !== undefined) reporter.tipsPos = tipsPos || null
  if (tipsCash !== undefined) reporter.tipsCash = tipsCash || null

  reporter.done = !!reporterFields.reduce((acc, fld) => {
    if (!acc) return false
    return !reporter[fld.enable] || reporter[fld.value]
  }, true)

  await connectors.reports.updateOne(report)

  resJson(res, {
    reports: [reportPublic(report)],
    lastId: reporter.id
  })
}
