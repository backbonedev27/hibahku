"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Role, { foreignKey: "roleid", as: "Role" });
    }
  }
  User.init(
    {
      nama: DataTypes.STRING,
      notelpon: DataTypes.STRING,
      password: DataTypes.STRING,
      nik: DataTypes.BIGINT,
      roleid: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
    }
  );
  return User;
};
