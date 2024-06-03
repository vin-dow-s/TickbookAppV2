const sequelize = require('../config/sequelize')
const { QueryTypes } = require('sequelize')
const { Template, Equiplist, Component } = require('../models')
const errorCodes = require('../config/errorCodes')

const getProjectTemplates = async (req, res, next) => {
    const jobNo = req.params.jobNo

    try {
        const query = `
        SELECT templates.ID AS ID, TempName, Component, ROUND(SUM(LabNorm), 3) AS Hours
        FROM templates
        INNER JOIN components ON components.ID = templates.Component_ID 
        WHERE templates.jobNo = :jobNo AND components.jobNo = :jobNo
        GROUP BY TempName
        ORDER BY TempName;
        `

        const templates = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: { jobNo },
        })

        res.json(templates)
    } catch (error) {
        console.error('Error while fetching the list of templates: ', error)
        res.status(500).json({ message: errorCodes.GENERIC_ERROR_MESSAGE })
    }
}

const getTemplateComponents = async (req, res, next) => {
    const { jobNo, tempName } = req.params

    try {
        const componentsInTemplate = await fetchTemplateComponents(
            jobNo,
            tempName
        )
        res.json(componentsInTemplate)
    } catch (error) {
        res.status(500).json({ message: errorCodes.GENERIC_ERROR_MESSAGE })
    }
}

const createTemplate = async (req, res, next) => {
    const { jobNo, TempName, components } = req.body

    if (!components || components.length === 0) {
        return res.status(400).json({ message: 'No components provided.' })
    }
    try {
        const existingTemplate = await Template.findOne({
            where: { JobNo: jobNo, TempName: TempName },
        })

        if (existingTemplate) {
            return res
                .status(409)
                .json({ message: 'This Template already exists.' })
        }

        let totalHours = 0
        let orderCounter = 1

        for (const { compName, compLabNorm } of components) {
            const componentData = await sequelize.query(
                `
                SELECT ID, ROUND(SUM(LabNorm), 3) AS Hours
                FROM components
                WHERE Name = :compName AND LabNorm = :compLabNorm AND JobNo = :jobNo
                GROUP BY ID
            `,
                {
                    type: QueryTypes.SELECT,
                    replacements: { compName, compLabNorm, jobNo },
                }
            )

            if (componentData.length > 0) {
                const componentID = componentData[0].ID
                const hours = componentData[0].Hours || 0

                await Template.create({
                    JobNo: jobNo,
                    TempName,
                    Component: compName,
                    InOrder: orderCounter++,
                    Component_ID: componentID,
                })

                totalHours += parseFloat(hours)
            }
        }

        res.status(201).json({
            JobNo: jobNo,
            TempName,
            Hours: Number(totalHours.toFixed(3)),
            message: 'Template lines successfully created!',
        })
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res
                .status(409)
                .json({ message: 'This Template already exists.' })
        }
        console.error('Error while creating template lines: ', error)
        res.status(500).json({ message: errorCodes.GENERIC_ERROR_MESSAGE })
    }
}

const bulkCreateTemplates = async (req, res) => {
    const jobNo = req.params.jobNo
    const templatesData = req.body

    let results = {
        success: [],
        alreadyExists: [],
        failures: [],
    }

    try {
        for (const { TempName, components } of templatesData) {
            if (!components || components.length === 0) {
                results.failures.push({
                    TempName,
                    reason: 'No components provided.',
                })
                continue
            }

            const existingTemplate = await Template.findOne({
                where: { JobNo: jobNo, TempName: TempName },
            })

            if (existingTemplate) {
                results.alreadyExists.push({ TempName })
                continue
            }

            let totalHours = 0
            let orderCounter = 1
            let templateCreationSuccessful = true

            for (const { compName, compLabNorm, inOrder } of components) {
                const componentData = await sequelize.query(
                    `SELECT ID, ROUND(SUM(LabNorm), 3) AS Hours FROM components
                     WHERE Name = :compName AND LabNorm = :compLabNorm AND JobNo = :jobNo
                     GROUP BY ID`,
                    {
                        type: QueryTypes.SELECT,
                        replacements: { compName, compLabNorm, jobNo },
                    }
                )

                if (componentData.length > 0) {
                    const componentID = componentData[0].ID
                    const hours = parseFloat(componentData[0].Hours) || 0

                    try {
                        await Template.create({
                            JobNo: jobNo,
                            TempName,
                            Component: compName,
                            InOrder:
                                typeof inOrder !== 'undefined'
                                    ? inOrder
                                    : orderCounter++,
                            Component_ID: componentID,
                        })

                        totalHours += parseFloat(hours)
                    } catch (error) {
                        console.error(
                            'Error while creating template line:',
                            error
                        )
                        results.failures.push({
                            TempName,
                            reason: 'Error creating template line.',
                        })
                        templateCreationSuccessful = false
                        break
                    }
                }
            }

            if (templateCreationSuccessful) {
                results.success.push({
                    TempName,
                    Hours: parseFloat(totalHours.toFixed(3)),
                })
            }
        }

        res.status(200).json(results)
    } catch (error) {
        console.error('Bulk template creation failed:', error)
        res.status(500).json({
            message: 'An error occurred during bulk template creation.',
        })
    }
}

const updateTemplate = async (req, res, next) => {
    const { jobNo, tempName } = req.params
    const components = req.body.components

    try {
        //Fetch existing Equiplists entries before deletion
        const existingEquipment = await Equiplist.findAll({
            where: { JobNo: jobNo, Template: tempName },
            group: ['Ref'],
        })

        //Delete existing Equiplists lines (easier in this situation than updating the corresponding ones)
        await Equiplist.destroy({
            where: { JobNo: jobNo, Template: tempName },
        })

        //Delete existing Template lines (easier in this situation than updating the corresponding ones)
        await Template.destroy({
            where: { JobNo: jobNo, TempName: tempName },
        })

        let totalHours = 0
        let orderCounter = 1

        //Create new Template lines
        for (let component of components) {
            await Template.create({
                JobNo: jobNo,
                TempName: tempName,
                Component: component.Component || component.Name,
                InOrder: orderCounter++,
                Component_ID: component.ID,
            })

            const componentData = await sequelize.query(
                `
                SELECT ROUND(SUM(LabNorm), 3) AS Hours
                FROM components
                WHERE id = :Component_ID AND jobNo = :jobNo
                `,
                {
                    type: QueryTypes.SELECT,
                    replacements: {
                        Component_ID: component.ID,
                        jobNo,
                    },
                }
            )

            totalHours += componentData?.[0]?.Hours ?? 0
        }

        const newTemplate = await Template.findOne({
            where: { JobNo: jobNo, TempName: tempName },
            attributes: ['ID'],
        })

        let newTemplateID = newTemplate.ID

        //Recreate all Equiplists deleted, with the new Template
        for (const equipmentData of existingEquipment) {
            for (let component of components) {
                await Equiplist.create({
                    JobNo: jobNo,
                    Ref: equipmentData.Ref,
                    Description: equipmentData.Description,
                    Template: tempName,
                    ProgID: equipmentData.ProgID,
                    TendID: equipmentData.TendID,
                    Component: component.Component || component.Name,
                    Component_ID: component.ID,
                    Template_ID: newTemplateID++,
                })
            }

            newTemplateID = newTemplate.ID
        }

        res.status(201).json({
            JobNo: jobNo,
            TempName: tempName,
            Hours: Number(totalHours.toFixed(3)),
            message: 'Template lines successfully created!',
        })
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res
                .status(409)
                .json({ message: 'This Template already exists.' })
        }
        console.error('Error while updating template: ', error)
        res.status(500).json({ message: errorCodes.GENERIC_ERROR_MESSAGE })
    }
}

const fetchTemplateComponents = async (jobNo, tempName) => {
    try {
        const query = `
        SELECT 
            templates.*,
            components.LabNorm
        FROM templates
        JOIN components ON templates.Component_ID = components.ID
        WHERE templates.jobNo = :jobNo AND templates.tempName = :tempName
        ORDER BY templates.InOrder ASC;
        `

        const componentsInTemplate = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: { jobNo, tempName },
        })

        return componentsInTemplate
    } catch (error) {
        console.error(
            'Error while fetching the list of components in template: ',
            error
        )
        throw error
    }
}

module.exports = {
    getProjectTemplates,
    getTemplateComponents,
    createTemplate,
    bulkCreateTemplates,
    updateTemplate,
    fetchTemplateComponents,
}
