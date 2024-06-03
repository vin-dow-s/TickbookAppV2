const errorCodes = require('../config/errorCodes')
const sequelize = require('../config/sequelize')
const { Code } = require('../models')

const getAllCodes = async (req, res, next) => {
    try {
        const Codes = await Code.findAll()

        res.json(Codes)
    } catch (error) {
        console.error('Error while fetching the list of Codes: ', error)
        res.status(500).json({ message: errorCodes.GENERIC_ERROR_MESSAGE })
    }
}

const createNewCode = async (req, res, next) => {
    try {
        const { code, name } = req.body

        if (!code || !name) {
            return res
                .status(400)
                .json({ message: 'Both Code and Name are required.' })
        }

        const newCode = await Code.create({ Code: code, Name: name })

        res.status(201).json(newCode)
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res
                .status(409)
                .json({ message: 'This Code already exists.' })
        }
        console.error('Error while creating a new Code: ', error)
        res.status(500).json({
            message: 'An error occurred while creating new Code.',
        })
    }
}

module.exports = {
    getAllCodes,
    createNewCode,
}
