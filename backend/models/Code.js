const { DataTypes } = require('sequelize')
const sequelize = require('../config/sequelize')

module.exports = (sequelize) => {
    const Code = sequelize.define(
        'codes',
        {
            Code: {
                type: DataTypes.CHAR(3),
                primaryKey: true,
                allowNull: false,
            },
            Name: {
                type: DataTypes.STRING(45),
                allowNull: false,
            },
        },
        {
            tableName: 'codes',
            timestamps: false,
        }
    )

    return Code
}
