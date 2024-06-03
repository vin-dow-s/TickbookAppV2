const { DataTypes } = require('sequelize')
const sequelize = require('../config/sequelize')

module.exports = (sequelize) => {
    const TickEquipList = sequelize.define(
        'TickEquipList',
        {
            ID: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            SeqNr: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
                defaultValue: 9999,
            },
            JobNo: {
                type: DataTypes.STRING(7),
                allowNull: false,
            },
            EquipRef: {
                type: DataTypes.STRING(80),
                allowNull: false,
            },
            TendSection: {
                type: DataTypes.STRING(25),
                allowNull: false,
            },
        },
        {
            tableName: 'TickEquipList',
            timestamps: false,
        }
    )

    return TickEquipList
}
