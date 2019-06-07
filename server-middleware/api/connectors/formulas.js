import { embedHash } from '../../../helpers/nodash'
import { db } from './db'

function formulaDbFromJson(json) {
  json = embedHash(json)
  return {
    formulaId: json.id,
    organizationId: json.organizationId,
    reportId: json.reportId,
    shared: !!json.shared,
    hash: json.hash,
    deleted: !!json.deleted,
    data: JSON.stringify(json)
  }
}

function formulaJsonFromDb(dbObj) {
  if (!dbObj) return
  let json = JSON.parse(dbObj.data)
  // patch up older schema. FUTURE: purge DB and delete these lines
  if (dbObj.hash) json.hash = dbObj.hash
  else if (!json.hash) json = embedHash(json)
  return json
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

  deleteOne(json, hashRead) {
    json.deleted = Date.now()
    return db.Formula.update(formulaDbFromJson(json), {
      where: { formulaId: json.id }
    })
  },

  updateOne(json, hashRead) {
    const dbObj = formulaDbFromJson(json)
    return db.Formula.update(dbObj, {
      where: { formulaId: json.id, hash: hashRead }
    }).then(() => formulaJsonFromDb(dbObj))
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
