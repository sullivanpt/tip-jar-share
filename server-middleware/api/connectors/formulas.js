import { db } from './db'

function formulaDbFromJson(json) {
  return {
    formulaId: json.id,
    organizationId: json.organizationId,
    reportId: json.reportId,
    shared: !!json.shared,
    deleted: !!json.deleted,
    data: JSON.stringify(json)
  }
}

function formulaJsonFromDb(dbObj) {
  if (!dbObj) return
  return JSON.parse(dbObj.data)
}

export default {
  purge() {
    return db.Formula.destroy({ where: { deleted: true } })
  },

  // don't do this if we want JSON to be correct
  // deleteAllByIds(formulaIds) {
  //   return db.Formula.update(
  //     { deleted: true },
  //     { where: { formulaId: formulaIds } }
  //   )
  // },

  /**
   * should not be called outside of a transaction
   */
  create(json, transaction) {
    return db.Formula.create(formulaDbFromJson(json), { transaction }).then(
      dbObj => formulaJsonFromDb(dbObj)
    )
  },

  bulkCreate(jsonArr) {
    return db.Formula.bulkCreate(jsonArr.map(formulaDbFromJson))
  },

  updateOne(json) {
    return db.Formula.update(formulaDbFromJson(json), {
      where: { formulaId: json.id }
    })
  },

  findOneByFormulaId(formulaId) {
    return db.Formula.findOne({
      where: { formulaId, deleted: false },
      attributes: ['data']
    }).then(dbObj => formulaJsonFromDb(dbObj))
  },

  dump() {
    return db.Formula.findAll({
      attributes: ['data']
    }).then(dbObjArr => dbObjArr.map(formulaJsonFromDb))
  },

  findAllByIds(formulaIds) {
    return db.Formula.findAll({
      where: { formulaId: formulaIds, deleted: false },
      attributes: ['data']
    }).then(dbObjArr => dbObjArr.map(formulaJsonFromDb))
  },

  findAllShared() {
    return db.Formula.findAll({
      where: { shared: true, deleted: false },
      attributes: ['data']
    }).then(dbObjArr => dbObjArr.map(formulaJsonFromDb))
  }
}
