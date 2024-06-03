const { DataTypes } = require('sequelize')
const sequelize = require('../config/sequelize')

module.exports = (sequelize) => {
    const Component = sequelize.define(
        'components',
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
            Name: {
                type: DataTypes.STRING(180),
                allowNull: false,
            },
            Code: {
                type: DataTypes.CHAR(3),
                allowNull: false,
            },
            LabNorm: {
                type: DataTypes.DOUBLE,
                allowNull: false,
                defaultValue: 0,
            },
            LabUplift: {
                type: DataTypes.DOUBLE,
                allowNull: false,
                defaultValue: 0,
            },
            MatNorm: {
                type: DataTypes.DOUBLE,
                allowNull: false,
                defaultValue: 0,
            },
            SubConCost: {
                type: DataTypes.DOUBLE,
                allowNull: false,
                defaultValue: 0,
            },
            SubConNorm: {
                type: DataTypes.DOUBLE,
                allowNull: false,
                defaultValue: 0,
            },
            PlantCost: {
                type: DataTypes.DOUBLE,
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            tableName: 'components',
            timestamps: false,
            indexes: [
                {
                    unique: true,
                    fields: ['JobNo', 'Name', 'LabNorm'],
                },
            ],
        }
    )

    return Component
}
