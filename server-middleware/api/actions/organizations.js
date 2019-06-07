import uuidV4 from 'uuid/v4'
import { resJson, resStatus } from '../connect-helpers'
import { pick } from '../../../helpers/nodash'
import { emailMask } from '../../../helpers/masks'
import { buildGravatarUrl } from '../../../helpers/gravatar'
import { hasOrganizationEdit } from '../../../helpers/organizations'
import * as connectors from '../connectors'
import { allPublicFromOrganizations } from './all'
import { defaultFormula, formulaClone } from './formulas'

/**
 * return only the public facing fields
 */
export function organizationPublic(organization, req) {
  const r = pick(organization, [
    'id',
    'hash',
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
export async function organizationCreate(req, res, next) {
  const { name, gravatar, timeOpen, timeClose, timeZone } = req.body
  if (!name || !timeOpen || !timeClose || !timeZone) return resStatus(res, 400)
  // we don't allow API to accept avatarURLs, must build from scratch
  const avatar = (gravatar && buildGravatarUrl(gravatar)) || null
  const gravatarMasked = avatar ? emailMask(gravatar) : null
  let organization = {
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
        name: req.me.name,
        position: 'bartender', // FUTURE: vary default position on srcFormula
        linkedId: req.me.id,
        code: null,
        edit: true,
        close: true,
        away: false
      }
    ]
  }
  organization = await connectors.organizations.createWithUserId(
    organization,
    organization.members[0]
  )

  // FUTURE: consider not adding the formula at create time
  const srcFormula = await defaultFormula()
  if (srcFormula) {
    const formula = formulaClone(srcFormula, organization.id)
    await connectors.formulas.create(formula)
    organization.formulaId = formula.id
    organization = await connectors.organizations.updateOne(
      organization,
      organization.hash
    )
  }

  const all = await allPublicFromOrganizations([organization], req)
  all.lastId = organization.id
  return resJson(res, all)
}

/**
 * route handler to update an organization
 */
export async function organizationUpdate(req, res, next) {
  let organization = await connectors.organizations.findOneByOrganizationId(
    req.body.organizationId
  )
  if (!organization) return next() // will 404
  if (!hasOrganizationEdit(req.me.id, organization)) return resStatus(res, 403)

  const { name, gravatar, timeOpen, timeClose, timeZone, formulaId } = req.body
  if (formulaId) {
    // formula must be for this organization (and not for a report)
    const formula = await connectors.formulas.findOneByFormulaId(formulaId)
    if (
      !formula ||
      formula.deleted ||
      formula.reportId ||
      formula.organizationId !== organization.id
    )
      return resStatus(res, 400)
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

  organization = await connectors.organizations.updateOne(
    organization,
    organization.hash
  )

  resJson(res, {
    organizations: [organizationPublic(organization, req)],
    lastId: organization.id
  })
}

/**
 * route handler to delete an organization and all its formulas and reports
 */
export async function organizationDelete(req, res, next) {
  const organization = await connectors.organizations.findOneByOrganizationId(
    req.body.organizationId
  )
  if (!organization) return next() // will 404
  if (!hasOrganizationEdit(req.me.id, organization)) return resStatus(res, 403)
  const formulaIds = []
  if (organization.formulaId) formulaIds.push(organization.formulaId)
  const reports = await connectors.reports.findAllByOrganizationIds([
    organization.id
  ])
  for (const rpt of reports) {
    await connectors.reports.deleteOne(rpt) // TODO: deleteAllByIds
  }
  const formulas = await connectors.formulas.findAllByIds(formulaIds)
  for (const fml of formulas) {
    await connectors.formulas.deleteOne(fml) // TODO: deleteAllByIds
  }
  await connectors.organizations.deleteWithCodesAndUserIds(organization)
  resStatus(res, 204)
}
