import { resJson, resStatus } from '../connect-helpers'
import { hasOrganizationClose } from '../../../helpers/organizations'
import * as connectors from '../connectors'
import { reportPublic } from './reports'

/**
 * route handler to update a collection in a report
 */
export async function reportCollectionUpdate(req, res, next) {
  const report = await connectors.reports.findOneByReportId(req.body.reportId)
  if (!report) return next() // will 404
  if (report.status === 'closed') return resStatus(res, 403)

  const collection = report.collections.find(
    col => col.id === req.body.collectionId
  )
  if (!collection) return next() // will 404
  const organization = await connectors.organizations.findOneByOrganizationId(
    report.organizationId
  )
  if (!organization) throw new Error('report.organizationId invalid')
  if (!hasOrganizationClose(req.me.id, organization)) return resStatus(res, 403)

  const { tipsCash } = req.body
  if (tipsCash !== undefined) collection.tipsCash = tipsCash || null
  collection.done = !!collection.tipsCash

  await connectors.reports.updateOne(report)

  resJson(res, {
    reports: [reportPublic(report)],
    lastId: collection.id
  })
}
