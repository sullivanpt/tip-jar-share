import db from '../../../db/models/index'
import users from './users'

/**
 * creates the database tables if they aren't created already
 */
export function modelsInitialize(force) {
  console.log(`modelsInitialize force ${force}`) // eslint-disable-line no-console
  return db.sequelize.sync({ force }).catch(e => {
    console.log('modelsInitialize error', e) // eslint-disable-line no-console
    throw e
  })
}

export { db, users }
