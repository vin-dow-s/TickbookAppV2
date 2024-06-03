'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('templates', 'Component_ID', {
            type: Sequelize.INTEGER,
            references: {
                model: 'components',
                key: 'ID',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        })
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('templates', 'Component_ID')
    },
}
