import { resJson, resStatus } from '../connect-helpers'
import { hasOrganizationView } from '../../../helpers/organizations'
import { allPublicFromOrganizations } from './all'
import { models } from './models'

/**
 * join an existing organization and return all the new data the user can see
 * TODO: rate limit this API to one global attempt per 3 seconds
 */
export function organizationJoin(req, res, next) {
  const { organizationMemberCode } = req.body
  if (!organizationMemberCode) return resStatus(res, 400)
  const organization = models.organizations.find(
    org =>
      !org.deleted &&
      org.members.find(mbr => mbr.code === organizationMemberCode)
  )
  if (!organization) return resStatus(res, 403)
  if (hasOrganizationView(req.me.id, organization)) return resStatus(res, 400)

  const member = organization.members.find(
    mbr => mbr.code === organizationMemberCode
  )
  if (!member) return next(new Error('organizationJoin member evaporated'))
  member.code = null
  member.linkedId = req.me.id

  const all = allPublicFromOrganizations([organization], req)
  return resJson(res, all)
}
