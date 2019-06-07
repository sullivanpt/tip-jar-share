import { embedHash } from '../../../helpers/nodash'
import { db } from './db'

function reportDbFromJson(json) {
  json = embedHash(json)
  return {
    reportId: json.id,
    organizationId: json.organizationId,
    formulaId: json.formulaId,
    date: json.date,
    hash: json.hash,
    deleted: !!json.deleted,
    data: JSON.stringify(json)
  }
}

function reportJsonFromDb(dbObj) {
  if (!dbObj) return
  let json = JSON.parse(dbObj.data)
  // patch up older schema. FUTURE: purge DB and delete these lines
  if (dbObj.hash) json.hash = dbObj.hash
  else if (!json.hash) json = embedHash(json)
  return json
}

export default {
  purge() {
    return db.Report.destroy({ where: { deleted: true } })
  },

  // don't do this if we want JSON to be correct
  // deleteAllByIds(reportIds) {
  //   return db.Report.update(
  //     { deleted: true },
  //     { where: { reportId: reportIds } }
  //   )
  // },

  /**
   * should not be called outside of a transaction
   */
  create(json, transaction) {
    return db.Report.create(reportDbFromJson(json), { transaction }).then(
      dbObj => reportJsonFromDb(dbObj)
    )
  },

  deleteOne(json) {
    json.deleted = Date.now()
    return db.Report.update(reportDbFromJson(json), {
      where: { reportId: json.id }
    })
  },

  updateOne(json, hashRead) {
    const dbObj = reportDbFromJson(json)
    return db.Report.update(dbObj, {
      where: { reportId: json.id, hash: hashRead }
    }).then(() => reportJsonFromDb(dbObj))
  },

  findOneByReportId(reportId) {
    return db.Report.findOne({
      where: { reportId, deleted: false },
      attributes: ['data']
    }).then(dbObj => reportJsonFromDb(dbObj))
  },

  findOneByOrganizationIdAndDate(organizationId, date) {
    return db.Report.findOne({
      where: { organizationId, date, deleted: false },
      attributes: ['data']
    }).then(dbObj => reportJsonFromDb(dbObj))
  },

  dump() {
    return db.Report.findAll({
      attributes: ['data']
    }).then(dbObjArr => dbObjArr.map(reportJsonFromDb))
  },

  // not used
  // findAllByIds(reportIds) {
  //   return db.Report.findAll({
  //     where: { reportId: reportIds, deleted: false },
  //     attributes: ['data']
  //   }).then(dbObjArr => dbObjArr.map(reportJsonFromDb))
  // },

  findAllByOrganizationIds(organizationIds) {
    return db.Report.findAll({
      where: { organizationId: organizationIds, deleted: false },
      attributes: ['data']
    }).then(dbObjArr => dbObjArr.map(reportJsonFromDb))
  }
}
