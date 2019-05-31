'use strict'
module.exports = (sequelize, DataTypes) => {
  const OrganizationCode = sequelize.define(
    'OrganizationCode',
    {
      organizationId: {
        allowNull: false,
        type: DataTypes.UUID
      },
      code: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING
      }
    },
    {}
  )
  OrganizationCode.associate = function(models) {
    // associations can be defined here
  }
  return OrganizationCode
}
