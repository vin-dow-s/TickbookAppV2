const errorCodes = require('../config/errorCodes')
const sequelize = require('../config/sequelize')
const { TickCCHist, TickCCHead } = require('../models')

const getAllCCs = async (req, res, next) => {
    try {
        const { jobNo } = req.params
        const CCs = await TickCCHist.findAll({
            include: [
                {
                    model: TickCCHead,
                    as: 'TickCCHead',
                    where: { JobNo: jobNo },
                    attributes: ['Descrip'],
                },
            ],
        })

        const ccsWithDescription = CCs.map((cc) => {
            const { Descrip } = cc.TickCCHead
            cc.dataValues.DateImp = formatDateString(cc.dataValues.DateImp)
            cc.dataValues.DateLift = formatDateString(cc.dataValues.DateLift)

            delete cc.dataValues.TickCCHead
            return { ...cc.dataValues, Descrip }
        })

        res.json(ccsWithDescription)
    } catch (error) {
        console.error('Error while fetching the list of CCs: ', error)
        res.status(500).json({ message: errorCodes.GENERIC_ERROR_MESSAGE })
    }
}

const createCCs = async (req, res, next) => {
    const { jobNo } = req.params
    const { SelectedRefs, CCRef, Description, Date } = req.body

    if (
        !SelectedRefs ||
        !SelectedRefs.length ||
        !CCRef ||
        !Description ||
        !Date
    ) {
        return res.status(400).json({ message: 'All fields are required.' })
    }

    try {
        const existingCC = await TickCCHist.findOne({
            where: { JobNo: jobNo, CcNr: CCRef },
        })

        if (existingCC) {
            return res
                .status(409)
                .json({ message: `CCRef ${CCRef} already exists.` })
        }

        const newCCs = []

        for (const EquipRef of SelectedRefs) {
            const newCC = await TickCCHist.create({
                JobNo: jobNo,
                EquipRef,
                CcNr: CCRef,
                DateImp: Date,
                DateLift: null,
                Current: 'current',
            })

            newCCs.push(newCC)
        }

        await TickCCHead.create({
            JobNo: jobNo,
            CcNr: CCRef,
            Descrip: Description,
        })

        if (newCCs.length > 0) {
            res.status(201).json(newCCs)
        } else {
            res.status(409).json({ message: 'No new CCs created.' })
        }
    } catch (error) {
        console.error('Error while creating a new CC: ', error)
        res.status(500).json({
            message: 'An error occurred while creating new CC.',
        })
    }
}

const updateCCs = async (req, res, next) => {
    const { jobNo, equipRef, ccRef } = req.params
    let { DateLift } = req.body

    try {
        const cc = await TickCCHist.findOne({
            where: { JobNo: jobNo, EquipRef: equipRef, CcNr: ccRef },
        })

        if (!cc) {
            return res.status(404).json({ message: 'CC not found.' })
        }

        if (DateLift) {
            const date = new Date(DateLift)
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
            DateLift = date.toISOString().split('T')[0]
        }

        await cc.update({
            DateLift,
            Current: DateLift ? 'lifted' : 'current',
        })

        res.json(cc)
    } catch (error) {
        console.error('Error while updating the CC: ', error)
        res.status(500).json({
            message: 'An error occurred while updating the CC.',
        })
    }
}

const formatDateString = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
        console.error(`Invalid date string: ${dateString}`)
        return null
    }
    return date.toISOString().split('T')[0]
}

module.exports = {
    getAllCCs,
    createCCs,
    updateCCs,
}
