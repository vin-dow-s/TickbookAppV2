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

        const revisionsWithFormattedDate = revisions.map((revision) => {
            revision.dataValues.Dated = formatDateString(
                revision.dataValues.Dated
            )

            return { ...revision.dataValues }
        })

        res.json(revisionsWithFormattedDate)
    } catch (error) {
        console.error('Error while fetching the list of revisions: ', error)
        res.status(500).json({ message: errorCodes.GENERIC_ERROR_MESSAGE })
    }
}

const formatDateString = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
        console.error(`Invalid date string: ${dateString}`)
        return null
    }
    return date.toISOString().replace('T', ' ').split('.')[0]
}

module.exports = {
    getProjectRevisions,
}
