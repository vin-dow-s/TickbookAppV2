'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.removeConstraint(
            'equiplists',
            'fk_equiplists_projects'
        )
        await queryInterface.removeConstraint('equiplists', 'PRIMARY')
        await queryInterface.addColumn('equiplists', 'id', {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            first: true,
        })
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('equiplists', 'id')
        await queryInterface.addConstraint('equiplists', {
            fields: ['JobNo'],
            type: 'foreign key',
            name: 'fk_equiplists_projects',
            references: {
                table: 'projects',
                field: 'JobNo',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        })
        await queryInterface.addConstraint('equiplists', {
            fields: ['Component'],
            type: 'foreign key',
            name: 'fk_equiplists_components',
            references: {
                table: 'components',
                field: 'Name',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        })
        await queryInterface.addConstraint('equiplists', {
            fields: ['jobNo', 'Ref', 'Component'],
            type: 'primary key',
            name: 'PRIMARY',
        })
    },
}
