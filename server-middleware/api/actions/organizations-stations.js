import uuidV4 from 'uuid/v4'
import { resJson, resStatus } from '../connect-helpers'
import { hasOrganizationEdit } from '../../../helpers/organizations'
import * as connectors from '../connectors'
import { organizationPublic } from './organizations'

/**
 * route handler to create a station in an organization
 */
export async function organizationStationCreate(req, res, next) {
  let organization = await connectors.organizations.findOneByOrganizationId(
    req.body.organizationId
  )
  if (!organization) return next() // will 404
  if (!hasOrganizationEdit(req.me.id, organization)) return resStatus(res, 403)

  const { name, position } = req.body
  if (!name || !position) return resStatus(res, 400)
  const station = {
    id: uuidV4(),
    name,
    position
  }
  organization.stations.push(station)
  organization = await connectors.organizations.updateOne(
    organization,
    organization.hash
  )

  resJson(res, {
    organizations: [organizationPublic(organization, req)],
    lastId: station.id
  })
}

/**
 * route handler to update a station in an organization
 */
export async function organizationStationUpdate(req, res, next) {
  let organization = await connectors.organizations.findOneByOrganizationId(
    req.body.organizationId
  )
  if (!organization) return next() // will 404
  if (!hasOrganizationEdit(req.me.id, organization)) return resStatus(res, 403)
  const station = organization.stations.find(
    stn => stn.id === req.body.stationId
  )
  if (!station) return next() // will 404
  const { name, position } = req.body
  if (name) station.name = name
  if (position) station.position = position
  organization = await connectors.organizations.updateOne(
    organization,
    organization.hash
  )

  resJson(res, {
    organizations: [organizationPublic(organization, req)],
    lastId: station.id
  })
}

/**
 * route handler to delete a station in an organization
 */
export async function organizationStationDelete(req, res, next) {
  let organization = await connectors.organizations.findOneByOrganizationId(
    req.body.organizationId
  )
  if (!organization) return next() // will 404
  if (!hasOrganizationEdit(req.me.id, organization)) return resStatus(res, 403)
  const station = organization.stations.find(
    stn => stn.id === req.body.stationId
  )
  if (!station) return next() // will 404
  organization.stations = organization.stations.filter(
    stn => stn.id !== station.id
  )
  organization = await connectors.organizations.updateOne(
    organization,
    organization.hash
  )

  resJson(res, {
    organizations: [organizationPublic(organization, req)],
    lastId: null
  })
}
