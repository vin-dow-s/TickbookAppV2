module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('users', {
            oid: {
                type: Sequelize.STRING,
                allowNull: false,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            email: {
                type: Sequelize.STRING(80),
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true,
                },
            },
        })
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('users')
    },
}
