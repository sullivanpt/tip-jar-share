import { embedHash } from '../../../helpers/nodash'
import { db } from './db'

function organizationDbFromJson(json) {
  json = embedHash(json)
  return {
    organizationId: json.id,
    formulaId: json.formulaId,
    hash: json.hash,
    deleted: !!json.deleted,
    label: json.name,
    data: JSON.stringify(json)
  }
}

function organizationJsonFromDb(dbObj) {
  if (!dbObj) return
  let json = JSON.parse(dbObj.data)
  // patch up older schema. FUTURE: purge DB and delete these lines
  if (dbObj.hash) json.hash = dbObj.hash
  else if (!json.hash) json = embedHash(json)
  return json
}

export default {
  purge() {
    return db.Organization.destroy({ where: { deleted: true } })
  },

  /**
   * mark organization deleted and remove all linked codes and userIds
   * assumes json is already updated
   */
  deleteWithCodesAndUserIds(json) {
    json.deleted = Date.now()
    return db.sequelize.transaction(transaction => {
      return db.Organization.update(organizationDbFromJson(json), {
        where: { organizationId: json.id },
        transaction
      })
        .then(() => {
          return db.OrganizationCode.destroy({
            where: { organizationId: json.id },
            transaction
          })
        })
        .then(() => {
          return db.OrganizationMember.destroy({
            where: { organizationId: json.id },
            transaction
          })
        })
    })
  },

  /**
   * normally called with he one member who is linked (owner)
   */
  createWithUserId(json, member) {
    let dbObj = null
    return db.sequelize
      .transaction(transaction => {
        return db.Organization.create(organizationDbFromJson(json), {
          transaction
        })
          .then(tdbObj => {
            dbObj = tdbObj
          })
          .then(() => {
            if (!member || !member.code) return // only true for example group
            return db.OrganizationCode.create(
              {
                organizationId: json.id,
                code: member.code
              },
              { transaction }
            )
          })
          .then(() => {
            if (!member || !member.linkedId) return // only false for example orgs
            return db.OrganizationMember.create(
              {
                organizationId: json.id,
                userId: member.linkedId
              },
              { transaction }
            )
          })
      })
      .then(() => organizationJsonFromDb(dbObj))
  },

  // do NOT use to change members[].code or linkedId
  updateOne(json, hashRead) {
    const dbObj = organizationDbFromJson(json)
    return db.Organization.update(dbObj, {
      where: { organizationId: json.id, hash: hashRead }
    }).then(([affectedCount]) => {
      if (affectedCount !== 1) throw new Error('TJS-CONFLICT')
      return organizationJsonFromDb(dbObj)
    })
  },

  /**
   * only use when also changing one members[].code and linkedId
   * @param {*} json the new organization
   * @param {*} param1.member the new organization.members[]
   */
  updateMemberCodeAndUserId(json, hashRead, { member, oldCode, oldLinkedId }) {
    const dbObj = organizationDbFromJson(json)
    return db.sequelize.transaction(transaction => {
      return db.Organization.update(dbObj, {
        where: { organizationId: json.id, hash: hashRead },
        transaction
      })
        .then(([affectedCount]) => {
          if (affectedCount !== 1) throw new Error('TJS-CONFLICT')
          if (!oldCode || member.code === oldCode) return
          return db.OrganizationCode.destroy({
            where: { code: oldCode }, // note: codes are global so no organizationId: json.id
            transaction
          })
        })
        .then(() => {
          if (!member.code || member.code === oldCode) return
          return db.OrganizationCode.create(
            {
              organizationId: json.id,
              code: member.code
            },
            { transaction }
          )
        })
        .then(() => {
          if (!oldLinkedId || member.linkedId === oldLinkedId) return
          return db.OrganizationMember.destroy({
            where: { organizationId: json.id, userId: oldLinkedId },
            transaction
          })
        })
        .then(() => {
          if (!member.linkedId || member.linkedId === oldLinkedId) return
          return db.OrganizationMember.create(
            {
              organizationId: json.id,
              userId: member.linkedId
            },
            { transaction }
          )
        })
        .then(() => organizationJsonFromDb(dbObj))
    })
  },

  findOneByOrganizationId(organizationId) {
    return db.Organization.findOne({
      where: { organizationId, deleted: false },
      attributes: ['data']
    }).then(dbObj => organizationJsonFromDb(dbObj))
  },

  findOneByCode(code) {
    return db.OrganizationCode.findOne({
      where: { code },
      attributes: ['organizationId']
    })
      .then(dbObj => {
        if (!dbObj) return null
        return db.Organization.findOne({
          where: { organizationId: dbObj.organizationId, deleted: false },
          attributes: ['data']
        })
      })
      .then(dbObj => organizationJsonFromDb(dbObj))
  },

  dump() {
    return db.Organization.findAll({
      attributes: ['data']
    }).then(dbObjArr => dbObjArr.map(organizationJsonFromDb))
  },

  dumpMembers() {
    return db.OrganizationMember.findAll({
      attributes: ['organizationId', 'userId']
    }).then(dbObjArr =>
      dbObjArr.map(dbo => ({
        organizationId: dbo.organizationId,
        userId: dbo.userId
      }))
    )
  },

  dumpCodes() {
    return db.OrganizationCode.findAll({
      attributes: ['organizationId', 'code']
    }).then(dbObjArr =>
      dbObjArr.map(dbo => ({
        organizationId: dbo.organizationId,
        code: dbo.code
      }))
    )
  },

  // not used
  // findAllByIds(organizationIds) {
  //   return db.Organization.findAll({
  //     where: { organizationId: organizationIds, deleted: false },
  //     attributes: ['data']
  //   }).then(dbObjArr => dbObjArr.map(organizationJsonFromDb))
  // },

  // i.e. hasOrganizationView
  findAllByUserId(userId) {
    return db.OrganizationMember.findAll({ where: { userId } })
      .then(omArr =>
        db.Organization.findAll({
          where: {
            organizationId: omArr.map(om => om.organizationId),
            deleted: false
          },
          attributes: ['data']
        })
      )
      .then(dbObjArr => dbObjArr.map(organizationJsonFromDb))
  }
}
