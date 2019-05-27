import { resJson, resStatus } from '../connect-helpers'
import { hasOrganizationClose } from '../../../helpers/organizations'
import { reportPublic } from './reports'
import { models } from './models'

/**
 * route handler to update a collection in a report
 */
export function reportCollectionUpdate(req, res, next) {
  const report = models.reports.find(
    rpt => !rpt.deleted && rpt.id === req.query.reportId
  )
  if (!report) return next() // will 404
  const collection = report.collections.find(
    col => col.id === req.query.collectionId
  )
  if (!collection) return next() // will 404
  const organization = models.organizations.find(
    org => !org.deleted && org.id === report.organizationId
  )
  if (!organization) return next(new Error('report.organizationId invalid'))
  if (!hasOrganizationClose(req.me.id, organization)) return resStatus(req, 403)
  if (report.status === 'closed') return resStatus(req, 403)

  const { tipsCash } = req.body
  if (tipsCash !== undefined) collection.tipsCash = tipsCash || null
  collection.done = !!collection.tipsCash

  resJson(res, reportPublic(report))
}
