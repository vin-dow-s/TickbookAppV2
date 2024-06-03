const { DataTypes } = require('sequelize')
const sequelize = require('../config/sequelize')

module.exports = (sequelize) => {
    const Template = sequelize.define(
        'templates',
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
            TempName: {
                type: DataTypes.STRING(80),
                allowNull: false,
            },
            Component: {
                type: DataTypes.STRING(180),
                allowNull: false,
            },
            InOrder: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                defaultValue: 1,
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
            tableName: 'templates',
            timestamps: false,
        }
    )

    return Template
}
