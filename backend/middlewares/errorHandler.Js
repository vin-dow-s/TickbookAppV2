const errorCodes = require('../config/errorCodes')

const errorHandler = (err, req, res, next) => {
    console.error(err)

    let errorCode = errorCodes.GENERIC_ERROR

    switch (err.name) {
        case 'SequelizeUniqueConstraintError':
            errorCode = errorCodes.UNIQUE_CONSTRAINT_ERROR
            break
        case 'SequelizeForeignKeyConstraintError':
            errorCode = errorCodes.FOREIGN_KEY_CONSTRAINT_ERROR
            break
    }

    res.status(errorCode.status).json({
        message: errorCode.message,
    })
}

module.exports = errorHandler
