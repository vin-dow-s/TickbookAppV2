const { DataTypes } = require('sequelize')
const sequelize = require('../config/sequelize')

module.exports = (sequelize) => {
    const TickCCHead = sequelize.define(
        'TickCCHead',
        {
            SeqNr: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 100,
            },
            CcNr: {
                type: DataTypes.STRING(25),
                primaryKey: true,
                allowNull: false,
            },
            Descrip: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            JobNo: {
                type: DataTypes.STRING(7),
                primaryKey: true,
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
