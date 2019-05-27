import { resJson } from '../connect-helpers'
import { hasOrganizationView } from '../../../helpers/organizations'
import { userPublic } from './users'
import { formulaPublic } from './formulas'
import { organizationPublic } from './organizations'
import { reportPublic } from './reports'
import { models } from './models'

/**
 * helper to collect all public data given a list of organizations
 */
export function allPublicFromOrganizations(organizations, req) {
  const userIds = Object.keys(
    organizations.reduce((acc, org) => {
      return org.members.reduce((acc, mbr) => {
        if (mbr.linkedId) acc[mbr.linkedId] = true
        return acc
      }, acc)
    }, {})
  )
  const users = models.users.filter(
    user => !user.deleted && userIds.includes(user.id)
  )
  const organizationIds = organizations.map(org => org.id)
  const reports = models.reports.filter(
    rpt => !rpt.deleted && organizationIds.includes(rpt.organizationId)
  )
  const formulaIds = reports
    .map(rpt => rpt.formulaId)
    .concat(
      organizations.reduce((acc, org) => {
        if (org.formulaId) acc.push(org.formulaId)
        return acc
      }, [])
    )
  const formulas = models.formulas.filter(
    fml => !fml.deleted && formulaIds.includes(fml.id)
  )
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
export function allRefresh(req, res, next) {
  const organizations = models.organizations.filter(
    org => !org.deleted && hasOrganizationView(req.me.id, org)
  )
  const all = allPublicFromOrganizations(organizations, req)
  return resJson(res, all)
}
