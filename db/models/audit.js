'use strict'
module.exports = (sequelize, DataTypes) => {
  const Audit = sequelize.define(
    'Audit',
    {
      auditId: {
        allowNull: false,
        unique: true,
        type: DataTypes.UUID
      },
      actorId: {
        allowNull: false,
        type: DataTypes.UUID
      },
      organizationId: {
        type: DataTypes.UUID
      },
      userId: {
        type: DataTypes.UUID
      },
      data: {
        allowNull: false,
        type: DataTypes.JSON
      }
    },
    {
      indexes: [{ fields: ['organizationId'] }, { fields: ['userId'] }]
    }
  )
  Audit.associate = function(models) {
    // associations can be defined here
  }
  return Audit
}
