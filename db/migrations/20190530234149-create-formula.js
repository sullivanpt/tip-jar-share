'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Formulas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      formulaId: {
        allowNull: false,
        unique: true,
        type: Sequelize.UUID
      },
      organizationId: {
        type: Sequelize.UUID
      },
      reportId: {
        type: Sequelize.UUID
      },
      shared: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      deleted: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
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
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Formulas')
  }
}
