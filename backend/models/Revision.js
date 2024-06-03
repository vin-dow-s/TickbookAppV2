const { DataTypes } = require('sequelize')
const sequelize = require('../config/sequelize')

module.exports = (sequelize) => {
    const Revision = sequelize.define(
        'revisions',
        {
            Number: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
            },
            Revision: {
                type: DataTypes.STRING(5),
                allowNull: false,
            },
            Item_Ref: {
                type: DataTypes.STRING(150),
                allowNull: false,
            },
            Item_Desc: {
                type: DataTypes.STRING(80),
                allowNull: false,
            },
            Notes: {
                type: DataTypes.STRING(200),
                allowNull: false,
            },
            JobNo: {
                type: DataTypes.STRING(7),
                allowNull: false,
            },
            Dated: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            tableName: 'revisions',
            timestamps: false,
        }
    )

    return Revision
}
