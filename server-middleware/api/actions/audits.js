import uuidV4 from 'uuid/v4'
import { pick } from '../../../helpers/nodash'
import { resJson } from '../connect-helpers'
import * as connectors from '../connectors'

/**
 * return only the public facing fields
 */
export function auditPublic(audit) {
  return pick(audit, [
    'id',
    'actorId',
    'organizationId',
    'userId',
    'reportId',
    'action',
    'label'
  ])
}

function defaultAudit(actor, action, label) {
  return {
    id: uuidV4(),
    actorId: actor.id,
    dateTime: new Date().toISOString(),
    organizationId: null,
    userId: null,
    reportId: null,
    action,
    label
  }
}

/**
 * internal helper
 */
export async function auditCreate(audit) {
  audit.id = uuidV4()
  audit.dateTime = new Date().toISOString()
  await connectors.audits.create(audit)
}

/**
 * internal helper when deleting organization
 * make sure each member has a unique record so they can see the
 * event in their feed even after the organization is deleted
 */
export async function auditOrganizationDelete(actor, organization) {
  const audit = defaultAudit(
    actor,
    'organizationDelete',
    `${actor.name} deleted ${organization.name}`
  )
  const audits = organization.members
    .filter(mbr => mbr.linkedId)
    .map(mbr =>
      Object.assign({}, audit, { id: uuidV4(), userId: mbr.linkedId })
    )
  await connectors.audits.bulkCreate(audits)
}

export async function auditsRefresh(req, res, next) {
  const audits = await connectors.findAllAuditsByUserId(req.me.id)
  resJson(res, { audits })
}
