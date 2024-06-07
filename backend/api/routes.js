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
router.get('/codes', codeController.getAllCodes)
router.post('/codes', codeController.createNewCode)

//Projects
router.get('/projects', projectController.getAllProjects)
router.post('/projects', projectController.createNewProject)

//Project details

//Revisions
router.get('/:jobNo/revisions', revisionController.getProjectRevisions)

//Components
router.get('/:jobNo/components', componentController.getProjectComponents)
router.get(
    '/:jobNo/components/non-cbs-and-labnorms',
    componentController.getProjectNonCBSComponentsWithLabnorm
)
router.get(
    '/:jobNo/is-component-used-in-template/:id',
    componentController.isComponentUsedInTemplate
)
router.post('/:jobNo/components', componentController.createComponent)
router.post('/:jobNo/components/bulk', componentController.bulkCreateComponents)
router.put('/:jobNo/components/:id', componentController.updateComponent)
router.delete('/:jobNo/components/:id', componentController.deleteComponent)

//Templates
router.get('/:jobNo/templates', templateController.getProjectTemplates)
router.get(
    '/:jobNo/templates/:template',
    templateController.getTemplateComponents
)
router.post('/:jobNo/templates', templateController.createTemplate)
router.post('/:jobNo/templates/bulk', templateController.bulkCreateTemplates)
router.put('/:jobNo/templates/:template', templateController.updateTemplate)

//Equipment
router.get('/:jobNo/equipment', equipmentController.getProjectEquipment)
router.get(
    '/:jobNo/equipment/refs-desc-area',
    equipmentController.getEquipmentRefsDescArea
)
router.get(
    '/:jobNo/equipment/area/:area/section/:section/codes',
    equipmentController.getComponentsCodesForASpecificEquipment
)
router.get('/:jobNo/tender-hours', equipmentController.getProjectTenderHours)
router.post('/:jobNo/equipment', equipmentController.createEquipment)
router.post('/:jobNo/equipment/bulk', equipmentController.bulkCreateEquipment)
router.put('/:jobNo/equipment/:ref', equipmentController.updateEquipment)
router.put(
    '/:jobNo/equipment/bulk/update',
    equipmentController.bulkUpdateEquipment
)
router.put(
    '/:jobNo/equipment/bulk/update-completion',
    equipmentController.bulkUpdateEquipmentCompletion
)
router.put(
    '/:jobNo/equipment/update-completion/:id',
    equipmentController.updateEquipRecoveryAndCompletion
)
router.delete('/:jobNo/equipment/:ref', equipmentController.deleteEquipment)

//Cabscheds
router.get('/:jobNo/cabscheds', cabschedsController.getProjectCabscheds)
router.get('/:jobNo/cabscheds/cabsizes', cabschedsController.getProjectCabSizes)
router.post('/:jobNo/cabscheds', cabschedsController.createCabsched)
router.post('/:jobNo/cabscheds/bulk', cabschedsController.bulkCreateCabscheds)
router.put('/:jobNo/cabscheds/:cabNum', cabschedsController.updateCabsched)
router.put(
    '/:jobNo/cabscheds/update-completion/:cabNum',
    cabschedsController.updateCabschedCompletion
)
router.delete('/:jobNo/cabscheds/:cabNum', cabschedsController.deleteCabsched)
router.post(
    '/:jobNo/cabscheds/mark-as-installed/:cabNum',
    cabschedsController.markCableAsInstalled
)

//Export
router.get('/:jobNo/export/full-detail', exportDataController.exportFullDetail)
router.get(
    '/:jobNo/export/main-table-data',
    exportDataController.exportMainTableData
)
router.get(
    '/:jobNo/export/view-table-data/:viewType',
    exportDataController.exportViewTableData
)

//CCs
router.get('/:jobNo/ccs', ccsController.getAllCCs)
router.post('/:jobNo/ccs', ccsController.createCCs)
router.put('/:jobNo/ccs/:equipRef/:ccRef', ccsController.updateCCs)

//Fetch project's info (MainInfoSection.jsx) based on jobNo
router.get('/:jobNo/projectInfo', async (req, res) => {
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
router.get('/:jobNo/mainTableData', async (req, res) => {
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
router.get('/:jobNo/viewTableData', async (req, res) => {
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
router.get('/:jobNo/summaryValues', async (req, res) => {
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
router.get('/:jobNo/:equipRef', async (req, res) => {
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
router.get('/:jobNo/area/:area/component/:component', async (req, res) => {
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
    '/:jobNo/area/:area/section/:section/component/:component',
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
router.get('/:jobNo/section/:section', async (req, res) => {
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
