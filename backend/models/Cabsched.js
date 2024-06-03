const { DataTypes } = require('sequelize')
const sequelize = require('../config/sequelize')

module.exports = (sequelize) => {
    const Cabsched = sequelize.define(
        'cabscheds',
        {
            JobNo: {
                type: DataTypes.STRING(7),
                primaryKey: true,
                allowNull: false,
            },
            CabNum: {
                type: DataTypes.STRING(45),
                primaryKey: true,
                allowNull: false,
            },
            Length: {
                type: DataTypes.DOUBLE,
                allowNull: false,
                defaultValue: 0,
            },
            EquipRef: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            AGlandArea: {
                type: DataTypes.STRING(45),
                allowNull: false,
            },
            ZGlandArea: {
                type: DataTypes.STRING(45),
                allowNull: false,
            },
            CabSize: {
                type: DataTypes.STRING(60),
                allowNull: false,
                defaultValue: 0,
            },
            AGlandComp: {
                type: DataTypes.DOUBLE,
                allowNull: false,
                defaultValue: 0,
            },
            ZGlandComp: {
                type: DataTypes.DOUBLE,
                allowNull: false,
                defaultValue: 0,
            },
            CabComp: {
                type: DataTypes.DOUBLE,
                allowNull: false,
                defaultValue: 0,
            },
            CabTest: {
                type: DataTypes.DOUBLE,
                allowNull: false,
                defaultValue: 0,
            },
            Component_ID: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'components',
                    key: 'ID',
                },
            },
        },
        {
            tableName: 'cabscheds',
            timestamps: false,
        }
    )

    return Cabsched
}
