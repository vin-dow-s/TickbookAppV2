const mysql = require('mysql2')
const dotenv = require('dotenv')

dotenv.config()

//Create connection to MySQL database
const database = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
})

const executeQuery = (sqlQuery, callback) => {
    database.query(sqlQuery, (err, result, fields) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, result);
    });
  };

  module.exports = {
    executeQuery,
  }