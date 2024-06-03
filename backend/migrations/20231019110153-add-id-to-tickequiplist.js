'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.removeConstraint(
            'tickequiplist',
            'fk_tickequiplist_projects'
        )
        await queryInterface.removeConstraint('tickequiplist', 'PRIMARY')
        await queryInterface.addColumn('tickequiplist', 'id', {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            first: true,
        })
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('tickequiplist', 'id')
        await queryInterface.addConstraint('tickequiplist', {
            fields: ['JobNo'],
            type: 'foreign key',
            name: 'fk_tickequiplist_projects',
            references: {
                table: 'projects',
                field: 'JobNo',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        })
    },
}
