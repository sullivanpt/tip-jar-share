'use strict'
module.exports = (sequelize, DataTypes) => {
  const Formula = sequelize.define(
    'Formula',
    {
      formulaId: {
        allowNull: false,
        unique: true,
        type: DataTypes.UUID
      },
      organizationId: {
        type: DataTypes.UUID
      },
      reportId: {
        type: DataTypes.UUID
      },
      shared: {
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN
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
    {}
  )
  Formula.associate = function(models) {
    // associations can be defined here
  }
  return Formula
}
