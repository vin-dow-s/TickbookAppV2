const { DataTypes } = require('sequelize')
const sequelize = require('../config/sequelize')

module.exports = (sequelize) => {
    const TickCCHead = sequelize.define(
        'TickCCHead',
        {
            JobNo: {
                type: DataTypes.STRING(7),
                primaryKey: true,
                allowNull: false,
            },
            SeqNr: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 100,
            },
            CcRef: {
                type: DataTypes.STRING(25),
                primaryKey: true,
                allowNull: false,
            },
            Description: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
        },
        {
            tableName: 'TickCCHead',
            timestamps: false,
        }
    )

    return TickCCHead
}
