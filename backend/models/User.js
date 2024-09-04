const { DataTypes } = require('sequelize')
const sequelize = require('../config/sequelize')

const User = sequelize.define(
    'User',
    {
        oid: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(80),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
    },
    {
        tableName: 'users',
        timestamps: false,
    }
)

module.exports = User
