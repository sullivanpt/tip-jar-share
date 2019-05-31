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
      date: {
        type: DataTypes.STRING
      },
      organizationId: {
        type: DataTypes.UUID
      },
      formulaId: {
        type: DataTypes.UUID
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
    {}
  )
  Report.associate = function(models) {
    // associations can be defined here
  }
  return Report
}
