import uuidV4 from 'uuid/v4'
import { resJson, resStatus } from '../connect-helpers'
import { isBoolean } from '../../../helpers/nodash'
import {
  hasOrganizationEdit,
  organizationIsOnlyLinkedWithEdit
} from '../../../helpers/organizations'
import { organizationPublic } from './organizations'
import { models } from './models'

/**
 * route handler to create a member in an organization
 */
export function organizationMemberCreate(req, res, next) {
  const organization = models.organizations.find(
    org => !org.deleted && org.id === req.query.organizationId
  )
  if (!organization) return next() // will 404
  if (!hasOrganizationEdit(req.me.id, organization)) return resStatus(req, 403)

  const { close, code, edit, name, position } = req.body
  if (!name) return resStatus(req, 400)
  organization.members.push({
    id: uuidV4(),
    name,
    position,
    code,
    edit,
    close,
    away: false
  })
  resJson(res, organizationPublic(organization, req))
}

/**
 * route handler to update a member in an organization
 */
export function organizationMemberUpdate(req, res, next) {
  const organization = models.organizations.find(
    org => !org.deleted && org.id === req.query.organizationId
  )
  if (!organization) return next() // will 404
  if (!hasOrganizationEdit(req.me.id, organization)) return resStatus(req, 403)
  const member = organization.members.find(mbr => mbr.id === req.query.memberId)
  if (!member) return next() // will 404
  const onlyEdit = organizationIsOnlyLinkedWithEdit(member, organization)
  const { away, close, name, linkedId, position } = req.body
  let { code, edit } = req.body

  if (isBoolean(away) && away) {
    code = null // don't leave open link code for away member
    edit = false // too confusing if we allow a away with edit
  }

  // at least one linked member must have edit
  if (isBoolean(edit) && !edit && onlyEdit) return resStatus(res, 400)
  if (linkedId !== undefined && linkedId !== member.linkedId) {
    if (linkedId !== null) return resStatus(res, 403) // must join to link
    if (onlyEdit) return resStatus(res, 403)
    member.linkedId = null // unlink
  }

  if (name) member.name = name
  if (position !== undefined) member.position = position
  if (code !== undefined) member.code = code
  if (isBoolean(close)) member.close = close
  if (isBoolean(away)) member.away = away
  if (isBoolean(edit)) member.edit = edit

  // TODO: when unlink self from organization make sure report and organization access is removed
  resJson(res, organizationPublic(organization, req))
}

/**
 * route handler to delete a member in an organization
 */
// not used -- use member.away
// export function organizationMemberDelete(req, res, next) {
//   const organization = models.organizations.find(
//     org => !org.deleted && org.id === req.query.organizationId
//   )
//   if (!organization) return next() // will 404
//   if (!hasOrganizationEdit(req.me.id, organization)) return resStatus(req, 403)
//   const member = organization.members.find(mbr => mbr.id === req.query.memberId)
//   if (!member) return next() // will 404
//   organization.members = organization.members.filter(
//     mbr => mbr.id !== member.id
//   )
//   resJson(res, organizationPublic(organization, req))
// }
