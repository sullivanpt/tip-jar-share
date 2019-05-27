import uuidV4 from 'uuid/v4'
import { resJson, resStatus } from '../connect-helpers'
import { hasOrganizationEdit } from '../../../helpers/organizations'
import { organizationPublic } from './organizations'
import { models } from './models'

/**
 * route handler to create a station in an organization
 */
export function organizationStationCreate(req, res, next) {
  const organization = models.organizations.find(
    org => !org.deleted && org.id === req.query.organizationId
  )
  if (!organization) return next() // will 404
  if (!hasOrganizationEdit(req.me.id, organization)) return resStatus(req, 403)

  const { name, position } = req.body
  if (!name || !position) return resStatus(req, 400)
  organization.stations.push({
    id: uuidV4(),
    name,
    position
  })
  resJson(res, organizationPublic(organization, req))
}

/**
 * route handler to update a station in an organization
 */
export function organizationStationUpdate(req, res, next) {
  const organization = models.organizations.find(
    org => !org.deleted && org.id === req.query.organizationId
  )
  if (!organization) return next() // will 404
  if (!hasOrganizationEdit(req.me.id, organization)) return resStatus(req, 403)
  const station = organization.stations.find(
    stn => stn.id === req.query.stationId
  )
  if (!station) return next() // will 404
  const { name, position } = req.body
  if (name) station.name = name
  if (position) station.position = position
  resJson(res, organizationPublic(organization, req))
}

/**
 * route handler to delete a station in an organization
 */
export function organizationStationDelete(req, res, next) {
  const organization = models.organizations.find(
    org => !org.deleted && org.id === req.query.organizationId
  )
  if (!organization) return next() // will 404
  if (!hasOrganizationEdit(req.me.id, organization)) return resStatus(req, 403)
  const station = organization.stations.find(
    stn => stn.id === req.query.stationId
  )
  if (!station) return next() // will 404
  organization.stations = organization.stations.filter(
    stn => stn.id !== station.id
  )
  resJson(res, organizationPublic(organization, req))
}
