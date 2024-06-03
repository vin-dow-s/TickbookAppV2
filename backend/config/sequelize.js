const { Sequelize } = require('sequelize')
require('dotenv').config()

//Connect Sequelize to database
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
    }
)

const checkDatabaseConnection = async () => {
    try {
        await sequelize.authenticate()
        console.log(
            'Connection to the database has been established successfully.'
        )
    } catch (error) {
        console.error('Unable to connect to the database:', error)
    }
}

checkDatabaseConnection()

module.exports = sequelize
