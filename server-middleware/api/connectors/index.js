import { db } from './db'
import audits from './audits'
import formulas from './formulas'
import organizations from './organizations'
import reports from './reports'
import users from './users'

/**
 * creates the database tables if they aren't created already
 */
export function modelsInitialize(force) {
  console.log(`modelsInitialize force ${force}`) // eslint-disable-line no-console
  const options = force ? { force } : { logging: false }
  return db.sequelize.sync(options).catch(e => {
    console.log('modelsInitialize error', e) // eslint-disable-line no-console
    throw e
  })
}

export function createReportAndFormula(report, formula) {
  return db.sequelize.transaction(transaction => {
    return formulas
      .create(formula, transaction)
      .then(() => reports.create(report, transaction))
  })
}

export function findAllAuditsByUserId(userId) {
  return organizations.findAllByUserId(userId).then(orgs => {
    const organizationIds = orgs.map(o => o.id)
    return audits.findAllByUserIdAndOrganizationIds(userId, organizationIds)
  })
}

export { db, audits, formulas, organizations, reports, users }
