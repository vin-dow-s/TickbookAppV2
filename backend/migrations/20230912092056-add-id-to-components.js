'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.removeConstraint(
            'components',
            'fk_components_codes'
        )
        await queryInterface.removeConstraint(
            'components',
            'fk_components_projects'
        )
        await queryInterface.removeConstraint(
            'templates',
            'fk_templates_components'
        )
        await queryInterface.removeConstraint('components', 'PRIMARY')
        await queryInterface.addColumn('components', 'id', {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            first: true,
        })
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('components', 'id')
        await queryInterface.addConstraint('components', {
            fields: ['Code'],
            type: 'foreign key',
            name: 'fk_components_codes',
            references: {
                table: 'codes',
                field: 'Code',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        })
        await queryInterface.addConstraint('components', {
            fields: ['JobNo'],
            type: 'foreign key',
            name: 'fk_components_projects',
            references: {
                table: 'projects',
                field: 'JobNo',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        })
        await queryInterface.addConstraint('components', {
            fields: ['Component'],
            type: 'foreign key',
            name: 'fk_templates_components',
            references: {
                table: 'components',
                field: 'Name',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        })
        await queryInterface.addConstraint('components', {
            fields: ['jobNo', 'Code', 'Name'],
            type: 'primary key',
            name: 'PRIMARY',
        })
    },
}
