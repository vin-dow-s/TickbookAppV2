'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('equiplists', 'Template_ID', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'templates',
                key: 'ID',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        })

        await queryInterface.changeColumn('equiplists', 'Component', {
            type: Sequelize.STRING(180),
            allowNull: false,
        })

        await queryInterface.changeColumn('templates', 'Component', {
            type: Sequelize.STRING(180),
            allowNull: false,
        })
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('equiplists', 'Template_ID')

        await queryInterface.changeColumn('equiplists', 'Component', {
            type: Sequelize.STRING(80),
            allowNull: false,
        })

        await queryInterface.changeColumn('templates', 'Component', {
            type: Sequelize.STRING(80),
            allowNull: false,
        })
    },
}
