'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Reports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      reportId: {
        allowNull: false,
        unique: true,
        type: Sequelize.UUID
      },
      organizationId: {
        // unique: 'reportDateIndex',
        type: Sequelize.UUID
      },
      formulaId: {
        type: Sequelize.UUID
      },
      date: {
        // unique: 'reportDateIndex', -- doesn't work with lazy delete
        type: Sequelize.STRING
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
    return queryInterface.dropTable('Reports')
  }
}
