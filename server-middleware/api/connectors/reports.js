import db from '../../../db/models/index'

function reportDbFromJson(json) {
  return {
    reportId: json.id,
    organizationId: json.organizationId,
    formulaId: json.formulaId,
    date: json.date,
    deleted: !!json.deleted,
    data: JSON.stringify(json)
  }
}

function reportJsonFromDb(dbObj) {
  if (!dbObj) return
  return JSON.parse(dbObj.data)
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

  updateOne(json) {
    return db.Report.update(reportDbFromJson(json), {
      where: { reportId: json.id }
    })
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
