import { resJson, resStatus } from '../connect-helpers'
import { reporterFields } from '../../../helpers/formulas'
import { hasOrganizationClose } from '../../../helpers/organizations'
import { reporterIsMe } from '../../../helpers/reports'
import { reportPublic } from './reports'
import { models } from './models'

/**
 * route handler to update a reporter in a report
 */
export function reportReporterUpdate(req, res, next) {
  const report = models.reports.find(
    rpt => !rpt.deleted && rpt.id === req.query.reportId
  )
  if (!report) return next() // will 404
  const reporter = report.reporters.find(
    rptr => rptr.id === req.query.reporterId
  )
  if (!reporter) return next() // will 404
  const organization = models.organizations.find(
    org => !org.deleted && org.id === report.organizationId
  )
  if (!organization) return next(new Error('report.organizationId invalid'))
  if (
    !reporterIsMe(req.me.id, reporter) &&
    !hasOrganizationClose(req.me.id, organization)
  )
    return resStatus(req, 403)
  if (report.status === 'closed') return resStatus(req, 403)

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

  resJson(res, reportPublic(report))
}
