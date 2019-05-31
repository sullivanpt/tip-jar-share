'use strict'
module.exports = (sequelize, DataTypes) => {
  const OrganizationMember = sequelize.define(
    'OrganizationMember',
    {
      organizationId: {
        allowNull: false,
        unique: 'organizationMemberIndex',
        type: DataTypes.UUID
      },
      userId: {
        allowNull: false,
        unique: 'organizationMemberIndex',
        type: DataTypes.UUID
      }
    },
    {}
  )
  OrganizationMember.associate = function(models) {
    // associations can be defined here
  }
  return OrganizationMember
}
