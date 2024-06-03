'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addIndex('cabscheds', ['CabNum'], {
            name: 'CabNum',
        })
        await queryInterface.addConstraint('tickcabbysc', {
            fields: ['CabNum'],
            type: 'foreign key',
            name: 'fk_tickcabbysc_cabscheds',
            references: {
                table: 'cabscheds',
                field: 'CabNum',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        })
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeConstraint(
            'tickcabbysc',
            'fk_tickcabbysc_cabscheds'
        )
    },
}
