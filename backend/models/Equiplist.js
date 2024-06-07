const { DataTypes } = require('sequelize')
const sequelize = require('../config/sequelize')

module.exports = (sequelize) => {
    const Equiplist = sequelize.define(
        'equiplists',
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
            Ref: {
                type: DataTypes.STRING(80),
                allowNull: false,
            },
            Description: {
                type: DataTypes.STRING(80),
                allowNull: false,
            },
            Template: {
                type: DataTypes.STRING(80),
                allowNull: false,
                defaultValue: '0',
            },
            Component: {
                type: DataTypes.STRING(180),
                allowNull: false,
            },
            Section: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            Complete: {
                type: DataTypes.DOUBLE,
                allowNull: false,
                defaultValue: 0,
            },
            Area: {
                type: DataTypes.STRING(40),
                allowNull: false,
            },
            Component_ID: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'components',
                    key: 'ID',
                },
            },
            Template_ID: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'templates',
                    key: 'ID',
                },
            },
        },
        {
            tableName: 'equiplists',
            timestamps: false,
            indexes: [
                {
                    unique: true,
                    fields: ['id'],
                },
            ],
        }
    )

    return Equiplist
}
