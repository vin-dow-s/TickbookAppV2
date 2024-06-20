const { DataTypes } = require('sequelize')
const sequelize = require('../config/sequelize')

module.exports = (sequelize) => {
    const TickCChist = sequelize.define(
        'TickCChist',
        {
            SeqNr: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true,
            },
            JobNo: {
                type: DataTypes.STRING(7),
                allowNull: false,
            },
            EquipRef: {
                type: DataTypes.STRING(80),
                allowNull: false,
            },
            CcRef: {
                type: DataTypes.STRING(25),
                allowNull: false,
            },
            DateImp: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            DateLift: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            Status: {
                type: DataTypes.STRING(10),
                allowNull: false,
                defaultValue: '""',
            },
        },
        {
            tableName: 'TickCChist',
            timestamps: false,
        }
    )

    return TickCChist
}
