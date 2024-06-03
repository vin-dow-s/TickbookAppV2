'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addIndex('equiplists', ['Ref'], {
            name: 'idx_equiplists_ref',
        })
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeIndex('equiplists', 'idx_equiplists_ref')
    },
}
