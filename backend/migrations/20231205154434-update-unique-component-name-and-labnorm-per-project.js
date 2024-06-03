'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addConstraint('components', {
            fields: ['JobNo', 'Name', 'LabNorm'],
            type: 'unique',
            name: 'unique_component_name_and_labnorm_per_project',
        })
        await queryInterface.removeConstraint(
            'components',
            'unique_component_name_per_project'
        )
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeConstraint(
            'components',
            'unique_component_name_and_labnorm_per_project'
        )
        await queryInterface.addConstraint('components', {
            fields: ['JobNo', 'Name'],
            type: 'unique',
            name: 'unique_component_name_per_project',
        })
    },
}
