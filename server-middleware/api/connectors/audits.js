import { db } from './db'

function auditDbFromJson(json) {
  // audits never change so we don't need a hash
  return {
    // not indexing action String, or dateTime ISO String
    auditId: json.id,
    actorId: json.actorId,
    organizationId: json.organizationId,
    userId: json.userId,
    data: JSON.stringify(json)
  }
}

function auditJsonFromDb(dbObj) {
  if (!dbObj) return
  return JSON.parse(dbObj.data)
}

export default {
  purge() {
    return db.Audit.destroy({
      where: {
        createdAt: {
          [db.Sequelize.Op.lt]: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      }
    })
  },

  create(json) {
    return db.Audit.create(auditDbFromJson(json)).then(dbObj =>
      auditJsonFromDb(dbObj)
    )
  },

  bulkCreate(jsonArr) {
    return db.Audit.bulkCreate(jsonArr.map(auditDbFromJson))
  },

  dump() {
    return db.Audit.findAll({
      order: [['createdAt', 'DESC']],
      attributes: ['data']
    }).then(dbObjArr => dbObjArr.map(auditJsonFromDb))
  },

  findAllByUserIdAndOrganizationIds(userId, organizationIds) {
    return db.Audit.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { userId: userId },
          { organizationId: organizationIds }
        ]
      },
      order: [['createdAt', 'DESC']],
      limit: 20,
      attributes: ['data']
    }).then(dbObjArr => dbObjArr.map(auditJsonFromDb))
  }
}
