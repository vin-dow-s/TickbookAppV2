const sequelize = require('../config/sequelize')
const { QueryTypes } = require('sequelize')
const { Revision } = require('../models')
const errorCodes = require('../config/errorCodes')

const getProjectRevisions = async (req, res, next) => {
    const jobNo = req.params.jobNo

    try {
        const revisions = await Revision.findAll({
            where: {
                jobNo: jobNo,
            },
            order: [['Dated', 'DESC']],
        })

        res.json(revisions)
    } catch (error) {
        console.error('Error while fetching the list of revisions: ', error)
        res.status(500).json({ message: errorCodes.GENERIC_ERROR_MESSAGE })
    }
}

module.exports = {
    getProjectRevisions,
}
