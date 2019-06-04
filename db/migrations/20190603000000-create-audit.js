'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('Audit', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        auditId: {
          allowNull: false,
          unique: true,
          type: Sequelize.UUID
        },
        actorId: {
          allowNull: false,
          type: Sequelize.UUID
        },
        organizationId: {
          type: Sequelize.UUID
        },
        userId: {
          type: Sequelize.UUID
        },
        data: {
          allowNull: false,
          type: Sequelize.JSON
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      })
      .then(() => queryInterface.addIndex('Audit', ['organizationId']))
      .then(() => queryInterface.addIndex('Audit', ['userId']))
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Audit')
  }
}
