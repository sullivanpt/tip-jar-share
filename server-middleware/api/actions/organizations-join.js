import { resJson, resStatus } from '../connect-helpers'
import { hasOrganizationView } from '../../../helpers/organizations'
import {
  cloneExampleOrganization,
  exampleOrganizationName,
  populateExampleReport
} from '../../../helpers/examples'
import { addDays, computeLastOpenDate } from '../../../helpers/time'
import { allPublicFromOrganizations } from './all'
import { defaultFormula, formulaClone } from './formulas'
import { reportCreateInternal } from './reports'
import { models } from './models'

/**
 * create a ready to go sample organization with
 * a populated report
 */
function buildExampleOrganization() {
  const organization = cloneExampleOrganization()
  models.organizations.push(organization)

  const srcFormula = defaultFormula()
  if (!srcFormula) return
  const formula = formulaClone(srcFormula, organization.id)
  organization.formulaId = formula.id

  // create a sample report yestersay
  const lastOpenDate = computeLastOpenDate(organization)
  const date = addDays(lastOpenDate, -1)
  const reportData = reportCreateInternal(organization, formula, date)

  // populate the report with data
  populateExampleReport(reportData.report)
}

/**
 * when code is 'DUK-FOO' and no organization 'Club Pluto' is reachable
 */
function checkForSampleCode(meId, organizationMemberCode) {
  if (organizationMemberCode !== 'DUK-FOO') return
  return !models.organizations.find(
    org =>
      hasOrganizationView(meId, org) && org.name === exampleOrganizationName
  )
}

/**
 * join an existing organization and return all the new data the user can see
 * TODO: keep history of linked/unlinked users to position
 */
export function organizationJoin(req, res, next) {
  const { organizationMemberCode } = req.body
  if (!organizationMemberCode) return resStatus(res, 400)
  // for testing and demonstrations, generate example just in time to join it
  if (checkForSampleCode(req.me.id, organizationMemberCode))
    buildExampleOrganization()
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
  all.lastId = organization.id
  return resJson(res, all)
}
