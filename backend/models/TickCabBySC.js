const { DataTypes } = require('sequelize')
const sequelize = require('../config/sequelize')

module.exports = (sequelize) => {
    const TickCabBySC = sequelize.define(
        'TickCabBySC',
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
            YN: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
        },
        {
            tableName: 'TickCabBySC',
            timestamps: false,
        }
    )

    return TickCabBySC
}
