const { DataTypes } = require('sequelize')
const sequelize = require('../config/sequelize')

module.exports = (sequelize) => {
    const TickRoot = sequelize.define(
        'TickRoot',
        {
            Root: {
                type: DataTypes.STRING(200),
                primaryKey: true,
                allowNull: false,
            },
        },
        {
            tableName: 'TickRoot',
            timestamps: false,
        }
    )

    return TickRoot
}
