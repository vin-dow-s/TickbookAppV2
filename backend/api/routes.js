const express = require('express')
const router = express.Router()

//Controllers
const cabschedsController = require('../controllers/cabschedsController')
const ccsController = require('../controllers/ccsController')
const codeController = require('../controllers/codeController')
const componentController = require('../controllers/componentController')
const equipmentController = require('../controllers/equipmentController')
const exportDataController = require('../controllers/exportDataController')
const projectController = require('../controllers/projectController')
const revisionController = require('../controllers/revisionController')
const templateController = require('../controllers/templateController')

/**
 * ROUTER
 */
//Codes
router.get('/api/codes', codeController.getAllCodes)
router.post('/api/codes', codeController.createNewCode)

//Projects
//Projects
router.get('/api/projects', projectController.getAllProjects)
router.post('/api/projects', projectController.createNewProject)

//Project details

//Revisions
router.get('/api/:jobNo/revisions', revisionController.getProjectRevisions)

//Components
router.get('/api/:jobNo/components', componentController.getProjectComponents)
router.get(
    '/api/:jobNo/is-component-used-in-template/:id',
    componentController.isComponentUsedInTemplate
)
router.post('/api/:jobNo/components', componentController.createComponent)
router.post(
    '/api/:jobNo/components/bulk',
    componentController.bulkCreateComponents
)
router.put('/api/:jobNo/components/:id', componentController.updateComponent)
router.put(
    '/api/:jobNo/components/bulk/update',
    componentController.bulkUpdateComponentsCodes
)
router.delete('/api/:jobNo/components/:id', componentController.deleteComponent)

//Templates
router.get('/api/:jobNo/templates', templateController.getProjectTemplates)
router.get(
    '/api/:jobNo/templates/:template',
    templateController.getTemplateComponents
)
router.post('/api/:jobNo/templates', templateController.createTemplate)
router.post(
    '/api/:jobNo/templates/bulk',
    templateController.bulkCreateTemplates
)
router.put('/api/:jobNo/templates/:template', templateController.updateTemplate)

//Equipment
router.get('/api/:jobNo/equipment', equipmentController.getProjectEquipment)
router.get(
    '/api/:jobNo/equipment/refs-desc-area',
    equipmentController.getEquipmentRefsDescArea
)
router.get(
    '/api/:jobNo/equipment/area/:area/section/:section/codes',
    equipmentController.getComponentsCodesForASpecificEquipment
)
router.get(
    '/api/:jobNo/tender-hours',
    equipmentController.getProjectTenderHours
)
router.post('/api/:jobNo/equipment', equipmentController.createEquipment)
router.post(
    '/api/:jobNo/equipment/bulk',
    equipmentController.bulkCreateEquipment
)
router.put('/api/:jobNo/equipment/:ref', equipmentController.updateEquipment)
router.put(
    '/api/:jobNo/equipment/bulk/update',
    equipmentController.bulkUpdateEquipment
)
router.put(
    '/api/:jobNo/equipment/bulk/update-completion-by-codes',
    equipmentController.bulkUpdateEquipmentCompletionByCodes
)
router.put(
    '/api/:jobNo/equipment/bulk/update-completion-by-components',
    equipmentController.bulkUpdateEquipmentCompletionByComponents
)
router.put(
    '/api/:jobNo/equipment/update-completion/:id',
    equipmentController.updateEquipRecoveryAndCompletion
)
router.delete('/api/:jobNo/equipment/:ref', equipmentController.deleteEquipment)

//Cabscheds
router.get('/api/:jobNo/cabscheds', cabschedsController.getProjectCabscheds)
router.get(
    '/api/:jobNo/cabscheds/cabsizes',
    cabschedsController.getProjectCabSizes
)
router.post('/api/:jobNo/cabscheds', cabschedsController.createCabsched)
router.post(
    '/api/:jobNo/cabscheds/bulk',
    cabschedsController.bulkCreateCabscheds
)
router.put('/api/:jobNo/cabscheds/:cabNum', cabschedsController.updateCabsched)
router.put(
    '/api/:jobNo/cabscheds/update-completion/:cabNum',
    cabschedsController.updateCabschedCompletion
)
router.delete(
    '/api/:jobNo/cabscheds/:cabNum',
    cabschedsController.deleteCabsched
)
router.post(
    '/api/:jobNo/cabscheds/mark-as-installed/:cabNum',
    cabschedsController.markCableAsInstalled
)

//Export
router.get(
    '/api/:jobNo/export/full-detail',
    exportDataController.exportFullDetail
)
router.get(
    '/api/:jobNo/export/main-table-data',
    exportDataController.exportMainTableData
)
router.get(
    '/api/:jobNo/export/view-table-data/:viewType',
    exportDataController.exportViewTableData
)

//CCs
router.get('/api/:jobNo/ccs', ccsController.getAllCCs)
router.post('/api/:jobNo/ccs', ccsController.createCCs)
router.put('/api/:jobNo/ccs/:equipRef/:ccRef', ccsController.updateCCs)

//Fetch project's info (MainInfoSection.jsx) based on jobNo
router.get('/api/:jobNo/projectInfo', async (req, res) => {
    const { jobNo } = req.params

    try {
        const projectInfo = await projectController.getMainProjectInfo(jobNo)

        res.json(projectInfo)
    } catch (error) {
        console.error(
            `Error while fetching project info for jobNo ${jobNo}:`,
            error
        )
        res.status(500).json({
            error: `Error while fetching project info for jobNo ${jobNo}:`,
        })
    }
})

//Fetch project's main table (DashboardView.jsx) data based on jobNo
router.get('/api/:jobNo/mainTableData', async (req, res) => {
    const { jobNo } = req.params

    try {
        const mainTableData = await projectController.getMainTableData(jobNo)

        res.json(mainTableData)
    } catch (error) {
        console.error(
            `Error while fetching main table data for jobNo ${jobNo}:`,
            error
        )
        res.status(500).json({
            error: `Error while fetching main table data for jobNo ${jobNo}:`,
        })
    }
})

//Fetch project's view table (DashboardView.jsx) data based on jobNo
router.get('/api/:jobNo/viewTableData', async (req, res) => {
    const { jobNo } = req.params
    const viewType = req.query.viewType

    try {
        if (!viewType) {
            return res.status(400).json({ error: 'viewType is required' })
        }

        const viewTableData = await projectController.getViewTableData(
            jobNo,
            viewType
        )

        res.json(viewTableData)
    } catch (error) {
        console.error(
            `Error while fetching viewTable data for jobNo ${jobNo}:`,
            error
        )
        res.status(500).json({
            error: `Error while fetching viewTable data for jobNo ${jobNo}:`,
        })
    }
})

//Fetch project's summary values (Summary.jsx) based on jobNo
router.get('/api/:jobNo/summaryValues', async (req, res) => {
    const { jobNo } = req.params

    try {
        const summaryValues = await projectController.getSummaryValues(jobNo)
        res.json(summaryValues)
    } catch (error) {
        console.error(
            `Error while fetching summary values for jobNo ${jobNo}:`,
            error
        )
        res.status(500).json({
            error: `Error while fetching summary values for jobNo ${jobNo}`,
        })
    }
})

//Fetch specific project's equipment data using jobNo and equipRef
router.get('/api/:jobNo/:equipRef', async (req, res) => {
    let { jobNo, equipRef } = req.params
    equipRef = decodeURIComponent(equipRef)

    try {
        const equipmentList =
            await equipmentController.getEquipmentListByEquipRef(
                jobNo,
                equipRef
            )

        if (equipmentList && equipmentList.length > 0) {
            res.json(equipmentList)
        } else {
            res.status(404).json({ message: 'Equipment not found' })
        }
    } catch (error) {
        console.error(
            `Error while fetching equipRef ${equipRef} for jobNo ${jobNo}:`,
            error
        )
        res.status(500).json({
            error: `Error while fetching equipment reference ${equipRef} for project ${jobNo}:`,
        })
    }
})

//Fetch specific area components's equipment list using jobNo, area and component
router.get('/api/:jobNo/area/:area/component/:component', async (req, res) => {
    let { jobNo, area, component } = req.params
    area = decodeURIComponent(area)
    component = decodeURIComponent(component)

    try {
        const equipmentList =
            await equipmentController.getEquipmentListByAreaComp(
                jobNo,
                area,
                component
            )

        if (equipmentList && equipmentList.length > 0) {
            res.json(equipmentList)
        } else {
            res.status(404).json({
                message: 'No equipment found for this area and component.',
            })
        }
    } catch (error) {
        console.error(
            `Error while fetching equipment in area ${area} and component ${component} for jobNo: ${jobNo}:`,
            error
        )
        res.status(500).json({
            error: `Error while fetching equipment in area ${area} and component ${component} for project ${jobNo}:`,
        })
    }
})

//Fetch specific area-section-component's equipment list using jobNo, area, section and component
router.get(
    '/api/:jobNo/area/:area/section/:section/component/:component',
    async (req, res) => {
        let { jobNo, area, section, component } = req.params
        area = decodeURIComponent(area)
        section = decodeURIComponent(section)
        component = decodeURIComponent(component)

        try {
            const equipmentList =
                await equipmentController.getEquipmentListByAreaSectionComp(
                    jobNo,
                    area,
                    section,
                    component
                )

            if (equipmentList && equipmentList.length > 0) {
                res.json(equipmentList)
            } else {
                res.status(404).json({
                    message:
                        'No equipment found for this area, section and component.',
                })
            }
        } catch (error) {
            console.error(
                `Error while fetching equipment in area ${area}, section ${section}, component ${component} for jobNo: ${jobNo}:`,
                error
            )
            res.status(500).json({
                error: `Error while fetching equipment area ${area}, section ${section}, component ${component} for project ${jobNo}:`,
            })
        }
    }
)

//Fetch specific section's equipment list using jobNo and section
router.get('/api/:jobNo/section/:section', async (req, res) => {
    let { jobNo, section } = req.params
    section = decodeURIComponent(section)

    try {
        const equipmentList =
            await equipmentController.getEquipmentListBySection(jobNo, section)

        if (equipmentList && equipmentList.length > 0) {
            res.json(equipmentList)
        } else {
            res.status(404).json({
                message: 'No equipment found for this section.',
            })
        }
    } catch (error) {
        console.error(
            `Error while fetching equipment in section ${section} for jobNo ${jobNo}:`,
            error
        )
        res.status(500).json({
            error: `Error while fetching equipment in section ${section} for project ${jobNo}:`,
        })
    }
})

module.exports = router
