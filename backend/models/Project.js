const { DataTypes } = require('sequelize')
const sequelize = require('../config/sequelize')

module.exports = (sequelize) => {
    const Project = sequelize.define(
        'projects',
        {
            JobNo: {
                type: DataTypes.STRING(7),
                primaryKey: true,
                allowNull: false,
                defaultValue: '',
            },
            Title: {
                type: DataTypes.STRING(45),
                allowNull: false,
                defaultValue: '',
            },
            Address: {
                type: DataTypes.STRING(45),
                allowNull: false,
                defaultValue: '',
            },
        },
        {
            tableName: 'projects',
            timestamps: false,
        }
    )

    return Project
}
