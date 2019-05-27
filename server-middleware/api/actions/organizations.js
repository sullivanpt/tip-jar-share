import uuidV4 from 'uuid/v4'
import { resJson, resStatus } from '../connect-helpers'
import { pick } from '../../../helpers/nodash'
import { emailMask } from '../../../helpers/masks'
import { buildGravatarUrl } from '../../../helpers/gravatar'
import { hasOrganizationEdit } from '../../../helpers/organizations'
import { defaultFormula, formulaClone } from './formulas'
import { models } from './models'

/**
 * return only the public facing fields
 */
export function organizationPublic(organization, req) {
  const r = pick(organization, [
    'id',
    'name',
    'gravatarMasked',
    'avatar',
    'timeZone',
    'timeOpen',
    'timeClose',
    'formulaId',
    'timeZone',
    'stations', // WARNING: this is a deep object
    'members' // WARNING: this is a deep object
  ])
  if (!hasOrganizationEdit(req.me.id, organization)) {
    r.members = r.members.map(({ code, ...attrs }) => ({
      code: code ? '-' : null, // hide code from non-managers
      ...attrs
    }))
  }
  return r
}

/**
 * route handler to create an organization
 */
export function organizationCreate(req, res, next) {
  const { name, gravatar, timeOpen, timeClose, timeZone } = req.body
  if (!name || !timeOpen || !timeClose || !timeZone) return resStatus(req, 400)
  // we don't allow API to accept avatarURLs, must build from scratch
  const avatar = (gravatar && buildGravatarUrl(gravatar)) || null
  const gravatarMasked = avatar ? emailMask(gravatar) : null
  const organization = {
    id: uuidV4(),
    name: name,
    gravatarMasked,
    avatar,
    timeOpen,
    timeClose,
    timeZone,
    formulaId: null,
    stations: [
      // FUTURE: vary default stations on srcFormula
      {
        id: uuidV4(),
        name: 'bar',
        position: 'bartender'
      }
    ],
    members: [
      {
        id: uuidV4(),
        position: 'bartender', // FUTURE: vary default position on srcFormula
        edit: true,
        close: true,
        away: false,
        name: req.me.name,
        linkedId: req.me.id
      }
    ]
  }
  models.organizations.push(organization)

  // FUTURE: consider not adding the formula at create time
  const srcFormula = defaultFormula()
  if (srcFormula)
    organization.formulaId = formulaClone(srcFormula, organization.id).id

  resJson(res, organizationPublic(organization, req))
}

/**
 * route handler to update an organization
 */
export function organizationUpdate(req, res, next) {
  const organization = models.organizations.find(
    org => !org.deleted && org.id === req.query.organizationId
  )
  if (!organization) return next() // will 404
  if (!hasOrganizationEdit(req.me.id, organization)) return resStatus(req, 403)

  const { name, gravatar, timeOpen, timeClose, timeZone, formulaId } = req.body
  if (formulaId) {
    // formula must be for this organization (and not for a report)
    const formula = models.formulas.find(
      fml => !fml.deleted && fml.id === formulaId
    )
    if (
      !formula ||
      formula.reportId ||
      formula.organizationId !== organization.id
    )
      return resStatus(req, 400)
  }

  if (gravatar !== undefined && gravatar !== organization.gravatarMasked) {
    // we don't allow API to accept avatarURLs, must build from scratch
    const avatar = (gravatar && buildGravatarUrl(gravatar)) || null
    const gravatarMasked = avatar ? emailMask(gravatar) : null
    organization.avatar = avatar
    organization.gravatarMasked = gravatarMasked
  }
  if (name) organization.name = name
  if (timeOpen) organization.timeOpen = timeOpen
  if (timeClose) organization.timeClose = timeClose
  if (timeZone) organization.timeZone = timeZone
  if (formulaId) organization.formulaId = formulaId

  resJson(res, organizationPublic(organization, req))
}

/**
 * route handler to delete an organization and all its formulas and reports
 */
export function organizationDelete(req, res, next) {
  const organization = models.organizations.find(
    org => !org.deleted && org.id === req.query.organizationId
  )
  if (!organization) return next() // will 404
  if (!hasOrganizationEdit(req.me.id, organization)) return resStatus(req, 403)
  const deleted = Date.now()
  const formulaIds = []
  if (organization.formulaId) formulaIds.push(organization.formulaId)
  models.reports.forEach(rpt => {
    if (!rpt.deleted && rpt.organizationId === organization.id) {
      formulaIds.push(rpt.formulaId)
      rpt.deleted = deleted
    }
  })
  models.formulas.forEach(fml => {
    if (formulaIds.includes(fml.id)) fml.deleted = deleted
  })
  organization.deleted = deleted
  resStatus(req, 204)
}
