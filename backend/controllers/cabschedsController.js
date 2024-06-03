const Sequelize = require('sequelize')
const { Cabsched, Component, TickCabBySC } = require('../models')
const errorCodes = require('../config/errorCodes')

const getProjectCabscheds = async (req, res, next) => {
    const jobNo = req.params.jobNo

    try {
        const cabscheds = await Cabsched.findAll({
            where: { JobNo: jobNo },
            include: [
                {
                    model: TickCabBySC,
                    as: 'tickCabBySC',
                    attributes: ['CabNum'],
                    where: { YN: 1 },
                    required: false,
                },
            ],
        })

        const transformedCabscheds = cabscheds.map((cabsched) => {
            const plainCabsched = cabsched.get({ plain: true })
            return {
                ...plainCabsched,
                AGlandComp: cabsched.AGlandComp * 100,
                ZGlandComp: cabsched.ZGlandComp * 100,
                CabComp: cabsched.CabComp * 100,
                CabTest: cabsched.CabTest * 100,
            }
        })

        res.json(transformedCabscheds)
    } catch (error) {
        console.error('Error while fetching the list of cabscheds: ', error)
        res.status(500).json({ message: errorCodes.GENERIC_ERROR_MESSAGE })
    }
}

const getProjectCabSizes = async (req, res, next) => {
    const jobNo = req.params.jobNo

    try {
        const cableComponents = await Component.findAll({
            where: {
                JobNo: jobNo,
                Code: 'cbs',
                [Sequelize.Op.and]: Sequelize.literal(
                    `Name NOT LIKE '%Term' AND Name NOT LIKE '%Test'`
                ),
            },
            attributes: ['Name', 'id'],
        })

        res.json(cableComponents)
    } catch (error) {
        console.error(
            'Error while fetching the list of cable components: ',
            error
        )
        res.status(500).json({ message: errorCodes.GENERIC_ERROR_MESSAGE })
    }
}

const createCabsched = async (req, res, next) => {
    const jobNo = req.params.jobNo

    try {
        const {
            CabNum,
            Length,
            EquipRef,
            AGlandArea,
            ZGlandArea,
            CabSize,
            Component_ID,
        } = req.body

        if (
            !CabNum ||
            !Length ||
            !EquipRef ||
            !AGlandArea ||
            !ZGlandArea ||
            !CabSize
        ) {
            return res.status(400).json({ message: 'All fields are required.' })
        }

        const newCable = await Cabsched.create({
            JobNo: jobNo,
            CabNum: CabNum,
            Length: parseFloat(Length),
            EquipRef: EquipRef,
            AGlandArea: AGlandArea,
            ZGlandArea: ZGlandArea,
            CabSize: CabSize,
            Component_ID: Component_ID,
        })

        res.status(201).json(newCable)
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res
                .status(409)
                .json({ message: 'This Cable already exists.' })
        }
        console.error('Error while creating a new Cable: ', error)
        res.status(500).json({
            message: 'An error occurred while creating new Cable.',
        })
    }
}

//Create Cabscheds on file upload scenario
const bulkCreateCabscheds = async (req, res) => {
    const cabschedsData = req.body
    let results = {
        success: [],
        alreadyExists: [],
        failures: [],
    }

    try {
        for (const data of cabschedsData) {
            try {
                // Check if the cabsched already exists
                const existingCabsched = await Cabsched.findOne({
                    where: { CabNum: data.CabNum, JobNo: data.JobNo },
                })

                if (existingCabsched) {
                    results.alreadyExists.push(data)
                    continue
                }

                // Create new cabsched
                const newCabsched = await Cabsched.create(data)

                newCabsched.CabComp *= 100
                newCabsched.CabTest *= 100
                newCabsched.AGlandComp *= 100
                newCabsched.ZGlandComp *= 100

                results.success.push(newCabsched)
            } catch (error) {
                results.failures.push({ data, reason: error.message })
            }
        }

        return res.status(200).json(results)
    } catch (error) {
        console.error('Bulk creation failed:', error)
        return res
            .status(500)
            .json({ message: 'An error occurred during bulk creation.' })
    }
}

const updateCabsched = async (req, res, next) => {
    const { jobNo, cabNum } = req.params
    const decodedCabNum = decodeURIComponent(cabNum)

    try {
        const existingCabsched = await Cabsched.findOne({
            where: {
                JobNo: jobNo,
                CabNum: decodedCabNum,
            },
        })

        if (!existingCabsched) {
            return res.status(400).json({ message: 'Cable not found.' })
        }

        const existingTick = await TickCabBySC.findOne({
            where: {
                JobNo: jobNo,
                CabNum: decodedCabNum,
            },
        })

        const dataToUpdate = req.body

        if (dataToUpdate.CabNum != decodedCabNum) {
            if (existingTick) {
                await existingTick.destroy()

                await TickCabBySC.create({
                    JobNo: jobNo,
                    CabNum: dataToUpdate.CabNum,
                    YN: 1,
                })
            }

            await existingCabsched.destroy()

            const updatedCabsched = await Cabsched.create({
                JobNo: jobNo,
                CabNum: dataToUpdate.CabNum,
                Length: Number(dataToUpdate.Length),
                EquipRef: dataToUpdate.EquipRef,
                AGlandArea: dataToUpdate.AGlandArea,
                ZGlandArea: dataToUpdate.ZGlandArea,
                CabSize: dataToUpdate.CabSize,
                AGlandComp: dataToUpdate.AGlandComp / 100,
                ZGlandComp: dataToUpdate.ZGlandComp / 100,
                CabComp: dataToUpdate.CabComp / 100,
                CabTest: dataToUpdate.CabTest / 100,
                Component_ID: dataToUpdate.Component_ID,
            })

            res.status(200).json(updatedCabsched)
        } else {
            const existingCabsched = await Cabsched.findOne({
                where: {
                    JobNo: jobNo,
                    CabNum: decodedCabNum,
                },
            })

            if (!existingCabsched) {
                return res.status(400).json({ message: 'Cable not found.' })
            }

            //Remove the completion fields for update (that is managed by updateCabschedCompletion)
            delete dataToUpdate.CabComp
            delete dataToUpdate.AGlandComp
            delete dataToUpdate.ZGlandComp
            delete dataToUpdate.CabTest

            const updatedCabsched = await existingCabsched.update(dataToUpdate)
            res.status(200).json(updatedCabsched)
        }
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res
                .status(409)
                .json({ message: 'This Cable already exists.' })
        }
        console.error('Error while editing the Cable: ', error)
        res.status(500).json({
            message: 'An error occurred while editing the Cable.',
        })
    }
}

const updateCabschedCompletion = async (req, res, next) => {
    const { jobNo, cabNum } = req.params
    const decodedCabNum = decodeURIComponent(cabNum)

    try {
        const existingCabsched = await Cabsched.findOne({
            where: {
                JobNo: jobNo,
                CabNum: decodedCabNum,
            },
            include: [
                {
                    model: TickCabBySC,
                    as: 'tickCabBySC',
                    attributes: ['CabNum'],
                    required: false,
                },
            ],
        })

        if (!existingCabsched) {
            return res.status(400).json({ message: 'Cable not found.' })
        }

        const dataToUpdate = req.body

        if (!existingCabsched) {
            return res.status(400).json({ message: 'Cable not found.' })
        }

        const updatedCabsched = await existingCabsched.update(dataToUpdate)

        //Multiply the properties by 100 for the frontend
        updatedCabsched.CabComp = Math.round(updatedCabsched.CabComp * 100)
        updatedCabsched.CabTest = Math.round(updatedCabsched.CabTest * 100)
        updatedCabsched.AGlandComp = Math.round(
            updatedCabsched.AGlandComp * 100
        )
        updatedCabsched.ZGlandComp = Math.round(
            updatedCabsched.ZGlandComp * 100
        )

        if (existingCabsched.tickCabBySC) {
            updatedCabsched.tickCabBySC = existingCabsched.tickCabBySC
        }

        res.status(200).json(updatedCabsched)
    } catch (error) {
        console.error(
            'Error while editing the the completion of the Cable Schedule: ',
            error
        )
        res.status(500).json({
            message:
                'An error occurred while editing the completion of the Cable Schedule.',
        })
    }
}

const deleteCabsched = async (req, res, next) => {
    const { jobNo, cabNum } = req.params
    const decodedCabNum = decodeURIComponent(cabNum)

    if (!jobNo || !decodedCabNum)
        throw new Error('jobNo or cabNum is not provided')

    try {
        const cable = await Cabsched.findOne({
            where: {
                JobNo: jobNo,
                CabNum: decodedCabNum,
            },
        })

        const existingTick = await TickCabBySC.findOne({
            where: {
                JobNo: jobNo,
                CabNum: decodedCabNum,
            },
        })

        if (!cable) return res.status(404).json({ message: 'Cable not found' })

        await cable.destroy()

        if (existingTick) await existingTick.destroy()

        res.status(204).send()
    } catch (error) {
        console.error('Error while deleting the Cable: ', error)
        res.status(500).json({ message: errorCodes.GENERIC_ERROR_MESSAGE })
    }
}

const markCableAsInstalled = async (req, res, next) => {
    const { jobNo, cabNum } = req.params
    const decodedCabNum = decodeURIComponent(cabNum)

    try {
        const existingTick = await TickCabBySC.findOne({
            where: {
                JobNo: jobNo,
                CabNum: decodedCabNum,
            },
        })

        if (existingTick) {
            await existingTick.destroy()
            res.status(201).send()
        } else {
            const newTick = await TickCabBySC.create({
                JobNo: jobNo,
                CabNum: decodedCabNum,
                YN: 1,
            })
            res.status(201).json(newTick)
        }
    } catch (error) {
        console.error(
            'Error while marking the cable as installed/uninstalled: ',
            error
        )
        res.status(500).json({
            message:
                'An error occurred while marking the cable as installed/uninstalled.',
        })
    }
}

module.exports = {
    getProjectCabscheds,
    getProjectCabSizes,
    createCabsched,
    bulkCreateCabscheds,
    updateCabsched,
    updateCabschedCompletion,
    deleteCabsched,
    markCableAsInstalled,
}
