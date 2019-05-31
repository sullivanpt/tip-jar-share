'use strict'
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      userId: {
        allowNull: false,
        unique: true,
        type: DataTypes.UUID
      },
      tjsSub: {
        allowNull: false,
        unique: true,
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
  User.associate = function(models) {
    // associations can be defined here
  }
  return User
}
