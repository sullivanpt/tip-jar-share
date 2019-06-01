import { resJson } from '../connect-helpers'
import { hasOrganizationView } from '../../../helpers/organizations'
import * as connectors from '../connectors'
import { userPublic } from './users'
import { formulaPublic } from './formulas'
import { organizationPublic } from './organizations'
import { reportPublic } from './reports'

/**
 * helper to collect all public data given a list of organizations
 */
export async function allPublicFromOrganizations(organizations, req) {
  const userIds = Object.keys(
    organizations.reduce((acc, org) => {
      return org.members.reduce((acc, mbr) => {
        if (mbr.linkedId) acc[mbr.linkedId] = true
        return acc
      }, acc)
    }, {})
  )
  const users = await connectors.users.findAllByIds(userIds)
  const organizationIds = organizations.map(org => org.id)
  const reports = await connectors.reports.findAllByOrganizationIds(
    organizationIds
  )
  const formulaIds = reports
    .map(rpt => rpt.formulaId)
    .concat(
      organizations.reduce((acc, org) => {
        if (org.formulaId) acc.push(org.formulaId)
        return acc
      }, [])
    )
  const formulas = await connectors.formulas.findAllByIds(formulaIds)
  return {
    users: users.map(userPublic), // note: includes req.me.id
    formulas: formulas.map(formulaPublic),
    organizations: organizations.map(org => organizationPublic(org, req)),
    reports: reports.map(reportPublic)
  }
}

/**
 * return all the data the user can see
 */
export async function allRefresh(req, res, next) {
  const organizations = await connectors.organizations.findAllByUserId(
    req.me.id
  )
  // double check our query was accurate
  organizations.forEach(org => {
    if (org.deleted || !hasOrganizationView(req.me.id, org))
      throw new Error(`allRefresh hasOrganizationView ${org.id}`)
  })
  const all = await allPublicFromOrganizations(organizations, req)
  return resJson(res, all)
}
