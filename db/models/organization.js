'use strict'
module.exports = (sequelize, DataTypes) => {
  const Organization = sequelize.define(
    'Organization',
    {
      organizationId: {
        allowNull: false,
        unique: true,
        type: DataTypes.UUID
      },
      formulaId: {
        type: DataTypes.UUID
      },
      hash: {
        type: DataTypes.STRING
      },
      deleted: {
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN
      },
      label: {
        type: DataTypes.STRING
      },
      data: {
        allowNull: false,
        type: DataTypes.JSON
      }
    },
    {}
  )
  Organization.associate = function(models) {
    // associations can be defined here
  }
  return Organization
}
