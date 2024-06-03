'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.removeConstraint(
            'templates',
            'fk_templates_projects'
        )
        await queryInterface.removeConstraint('templates', 'PRIMARY')
        await queryInterface.addColumn('templates', 'id', {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            first: true,
        })
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('templates', 'id')
        await queryInterface.addConstraint('templates', {
            fields: ['JobNo'],
            type: 'foreign key',
            name: 'fk_templates_projects',
            references: {
                table: 'projects',
                field: 'JobNo',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        })
        await queryInterface.addConstraint('templates', {
            fields: ['JobNo', 'TempName', 'Component', 'InOrder'],
            type: 'primary key',
            name: 'PRIMARY',
        })
    },
}
