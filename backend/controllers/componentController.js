const { Component, Template } = require('../models')
const errorCodes = require('../config/errorCodes')
const {
    onlyFloatsPattern,
    componentsCodePattern,
    componentsNamePattern,
} = require('../config/validation')
const { Op } = require('sequelize')

const getProjectComponents = async (req, res, next) => {
    const jobNo = req.params.jobNo

    try {
        const components = await Component.findAll({
            where: {
                jobNo: jobNo,
            },
            order: ['Name', 'Code'],
        })

        res.json(components)
    } catch (error) {
        next(error)
    }
}

const getProjectNonCBSComponentsWithLabnorm = async (req, res, next) => {
    const jobNo = req.params.jobNo

    try {
        const components = await Component.findAll({
            attributes: ['ID', 'Name', 'LabNorm'],
            where: {
                jobNo: jobNo,
                Code: {
                    [Op.ne]: 'cbs',
                },
            },
            order: ['Name', 'LabNorm'],
        })

        res.json(components)
    } catch (error) {
        next(error)
    }
}

const createComponent = async (req, res, next) => {
    const jobNo = req.params.jobNo

    try {
        const {
            Code,
            Name,
            LabNorm,
            LabUplift,
            MatNorm,
            SubConCost,
            SubConNorm,
            PlantCost,
        } = req.body

        if (
            Code === undefined ||
            Name === undefined ||
            LabNorm === undefined ||
            LabUplift === undefined ||
            MatNorm === undefined ||
            SubConCost === undefined ||
            SubConNorm === undefined ||
            PlantCost === undefined
        ) {
            return res.status(400).json({ message: 'All fields are required.' })
        }

        if (!validateComponentData(req.body)) {
            return res.status(400).json({ message: 'Invalid data format.' })
        }

        const existingComponent = await Component.findOne({
            where: {
                JobNo: jobNo,
                Name: Name,
                LabNorm: LabNorm,
            },
        })

        if (existingComponent) {
            return res
                .status(409)
                .json({ message: 'This Component already exists.' })
        }

        const newComponent = await Component.create({
            JobNo: jobNo,
            Name: Name,
            Code: Code,
            LabNorm: LabNorm,
            LabUplift: LabUplift,
            MatNorm: MatNorm,
            SubConCost: SubConCost,
            SubConNorm: SubConNorm,
            PlantCost: PlantCost,
        })

        res.status(201).json(newComponent)
    } catch (error) {
        next(error)
    }
}

const bulkCreateComponents = async (req, res) => {
    const jobNo = req.params.jobNo

    // Add jobNo to each component data
    const componentsData = req.body.map((data) => ({ ...data, JobNo: jobNo }))

    let results = {
        success: [],
        alreadyExists: [],
        failures: [],
    }

    try {
        for (let data of componentsData) {
            try {
                // Validate required fields and data format
                if (!validateComponentData(data)) {
                    results.failures.push({
                        lineNumber: data.lineNumber,
                        componentData: data,
                        reason: 'Invalid data format or missing fields',
                    })
                    continue
                }

                // Check if the component already exists
                const existingComponent = await Component.findOne({
                    where: {
                        JobNo: jobNo,
                        Name: data.Name,
                        LabNorm: data.LabNorm,
                    },
                })

                if (existingComponent) {
                    results.alreadyExists.push(existingComponent)
                    continue
                }

                // Create new component
                const newComponent = await Component.create(data)
                results.success.push(newComponent)
            } catch (error) {
                results.failures.push({
                    lineNumber: data.lineNumber,
                    componentData: data,
                    reason: error.message,
                })
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

const updateComponent = async (req, res, next) => {
    const { jobNo, id } = req.params
    let dataToUpdate = req.body

    try {
        const existingComponent = await Component.findOne({
            where: {
                id,
                JobNo: jobNo,
            },
        })

        if (!existingComponent) {
            return res.status(400).json({ message: 'Component not found.' })
        }

        if (!validateComponentData(dataToUpdate)) {
            return res.status(400).json({ message: 'Invalid data format.' })
        }

        const usedInTemplate = await Template.findOne({
            where: {
                JobNo: jobNo,
                Component_ID: existingComponent.ID,
            },
        })

        //If the Component is used in a Template, only its Code can be changed
        if (usedInTemplate) {
            const { Code } = dataToUpdate
            if (Code && Code !== existingComponent.Code) {
                const updatedComponent = await existingComponent.update({
                    Code,
                })
                return res.status(200).json(updatedComponent)
            } else {
                return res.status(403).json({
                    message:
                        'This Component is used in a Template; only its Code can be updated.',
                })
            }
        }

        if (dataToUpdate.Name) dataToUpdate.Name = dataToUpdate.Name.trim()

        //If the Component is not used in a Template, update it fully
        const updatedComponent = await existingComponent.update(dataToUpdate)

        res.status(200).json(updatedComponent)
    } catch (error) {
        next(error)
    }
}

const deleteComponent = async (req, res, next) => {
    const { jobNo, id } = req.params

    if (!jobNo || !id) throw new Error('jobNo or id is not provided')

    try {
        const existingComponent = await Component.findOne({
            where: {
                id,
                JobNo: jobNo,
            },
        })

        if (!existingComponent)
            return res.status(404).json({ message: 'Component not found' })

        const componentInTemplate = await Template.findOne({
            where: { JobNo: jobNo, Component_ID: existingComponent.ID },
        })

        if (componentInTemplate) {
            return res.status(403).json({
                message:
                    'This Component is used in a Template, it cannot be deleted.',
            })
        }

        await existingComponent.destroy()
        res.status(204).send()
    } catch (error) {
        next(error)
    }
}

const isComponentUsedInTemplate = async (req, res, next) => {
    const { jobNo, id } = req.params

    try {
        const usedInTemplate = await Template.findOne({
            where: {
                JobNo: jobNo,
                Component_ID: id,
            },
        })

        if (usedInTemplate) {
            return res.status(403).json({
                message:
                    'This Component is used in a Template, it cannot be deleted.',
            })
        }

        res.status(200).json({ message: 'Component can be edited.' })
    } catch (error) {
        next(error)
    }
}

const validateComponentData = (data) => {
    const isValidCode = componentsCodePattern.test(data.Code)
    const isValidName = componentsNamePattern.test(data.Name)
    const isValidLabNorm = onlyFloatsPattern.test(data.LabNorm)
    const isValidLabUplift = onlyFloatsPattern.test(data.LabUplift)
    const isValidMatNorm = onlyFloatsPattern.test(data.MatNorm)
    const isValidSubConCost = onlyFloatsPattern.test(data.SubConCost)
    const isValidSubConNorm = onlyFloatsPattern.test(data.SubConNorm)
    const isValidPlantCost = onlyFloatsPattern.test(data.PlantCost)

    let isValidGlandNorm = true
    let isValidTestNorm = true

    if (data.Code === 'cbs' && data.GlandNorm && data.TestNorm) {
        isValidGlandNorm = onlyFloatsPattern.test(data.GlandNorm)
        isValidTestNorm = onlyFloatsPattern.test(data.TestNorm)
    }

    return (
        isValidCode &&
        isValidName &&
        isValidLabNorm &&
        isValidLabUplift &&
        isValidMatNorm &&
        isValidSubConCost &&
        isValidSubConNorm &&
        isValidPlantCost &&
        isValidGlandNorm &&
        isValidTestNorm
    )
}

module.exports = {
    getProjectComponents,
    getProjectNonCBSComponentsWithLabnorm,
    createComponent,
    bulkCreateComponents,
    updateComponent,
    deleteComponent,
    isComponentUsedInTemplate,
}
