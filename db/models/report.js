'use strict'
module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define(
    'Report',
    {
      reportId: {
        allowNull: false,
        unique: true,
        type: DataTypes.UUID
      },
      organizationId: {
        // unique: 'reportDateIndex',
        type: DataTypes.UUID
      },
      formulaId: {
        type: DataTypes.UUID
      },
      date: {
        // unique: 'reportDateIndex', -- doesn't work with lazy delete
        type: DataTypes.STRING
      },
      hash: {
        type: DataTypes.STRING
      },
      deleted: {
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN
      },
      data: {
        allowNull: false,
        type: DataTypes.JSON
      }
    },
    {
      indexes: [{ fields: ['organizationId'] }]
    }
  )
  Report.associate = function(models) {
    // associations can be defined here
  }
  return Report
}
