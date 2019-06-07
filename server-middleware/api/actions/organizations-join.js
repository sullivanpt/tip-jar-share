import { resJson, resStatus } from '../connect-helpers'
import { hasOrganizationView } from '../../../helpers/organizations'
import {
  cloneExampleOrganization,
  exampleOrganizationName,
  populateExampleReport
} from '../../../helpers/examples'
import { addDays, computeLastOpenDate } from '../../../helpers/time'
import * as connectors from '../connectors'
import { allPublicFromOrganizations } from './all'
import { defaultFormula, formulaClone } from './formulas'
import { reportCreateInternal } from './reports'

/**
 * create a ready to go sample organization with
 * a populated report
 */
async function buildExampleOrganization() {
  let organization = cloneExampleOrganization()
  // TODO: valid example owner
  organization = await connectors.organizations.createWithUserId(
    organization,
    organization.members[0]
  )

  const srcFormula = await defaultFormula()
  if (!srcFormula) return
  const formula = formulaClone(srcFormula, organization.id)
  await connectors.formulas.create(formula)
  organization.formulaId = formula.id
  await connectors.organizations.updateOne(organization, organization.hash)

  // create a sample report yestersay
  const lastOpenDate = computeLastOpenDate(organization)
  const date = addDays(lastOpenDate, -1)
  const reportData = await reportCreateInternal(organization, formula, date)

  // populate the report with data
  populateExampleReport(reportData.report)
  await connectors.reports.updateOne(reportData.report, reportData.report.hash)
}

/**
 * when code is 'DUK-FOO' and no organization 'Club Pluto' is reachable
 */
async function checkForSampleCode(meId, organizationMemberCode) {
  if (organizationMemberCode !== 'DUK-FOO') return
  const organizations = await connectors.organizations.findAllByUserId(meId)
  return !organizations.find(
    org =>
      !org.deleted &&
      hasOrganizationView(meId, org) &&
      org.name === exampleOrganizationName
  )
}

/**
 * join an existing organization and return all the new data the user can see
 * TODO: keep history of linked/unlinked users to position
 */
export async function organizationJoin(req, res, next) {
  const { organizationMemberCode } = req.body
  if (!organizationMemberCode) return resStatus(res, 400)
  // for testing and demonstrations, generate example just in time to join it
  if (await checkForSampleCode(req.me.id, organizationMemberCode))
    await buildExampleOrganization()
  let organization = await connectors.organizations.findOneByCode(
    organizationMemberCode
  )
  if (!organization) return resStatus(res, 403)
  if (hasOrganizationView(req.me.id, organization)) return resStatus(res, 400)

  const member = organization.members.find(
    mbr => mbr.code === organizationMemberCode && !mbr.linkedId
  )
  if (!member) throw new Error('organizationJoin member evaporated')
  member.code = null
  member.linkedId = req.me.id
  organization = await connectors.organizations.updateMemberCodeAndUserId(
    organization,
    organization.hash,
    {
      member,
      oldCode: organizationMemberCode,
      oldLinkedId: null
    }
  )

  const all = await allPublicFromOrganizations([organization], req)
  all.lastId = organization.id
  return resJson(res, all)
}
