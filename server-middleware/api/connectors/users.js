import db from '../../../db/models/index'

function usersDbFromJson(json) {
  return {
    // FUTURE: only set userId, tjsSub on create?
    userId: json.id,
    tjsSub: json.tjsSub,
    deleted: !!json.deleted,
    label: json.emailMasked,
    data: JSON.stringify(json)
  }
}

function usersJsonFromDb(dbObj) {
  if (!dbObj) return
  return JSON.parse(dbObj.data)
}

export default {
  purge() {
    return db.User.destroy({ where: { deleted: true } })
  },

  findOrCreate(json) {
    return db.User.findOrCreate({
      where: { userId: json.id },
      defaults: usersDbFromJson(json),
      attributes: ['data']
    }).then(([dbObj, created]) => usersJsonFromDb(dbObj))
  },

  updateOne(json) {
    return db.User.update(usersDbFromJson(json), { where: { userId: json.id } })
  },

  findOneByTjsSub(tjsSub) {
    return db.User.findOne({
      where: { tjsSub, deleted: false },
      attributes: ['data']
    }).then(dbObj => usersJsonFromDb(dbObj))
  },

  findAllByIds(userIds) {
    return db.User.findAll({
      where: { userId: userIds, deleted: false },
      attributes: ['data']
    }).then(dbObjArr => dbObjArr.map(usersJsonFromDb))
  }
}
