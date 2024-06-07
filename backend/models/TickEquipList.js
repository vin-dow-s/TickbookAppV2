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
            JobNo: {
                type: DataTypes.STRING(7),
                allowNull: false,
            },
            SeqNr: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
                defaultValue: 9999,
            },
            EquipRef: {
                type: DataTypes.STRING(80),
                allowNull: false,
            },
            TendSection: {
                type: DataTypes.STRING(45),
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
