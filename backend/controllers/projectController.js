const sequelize = require('../config/sequelize')
const { QueryTypes } = require('sequelize')
const { Project } = require('../models')
const {
    getViewByAreaData,
    getViewByAreaCompData,
    getViewByAreaSectionCompData,
    getViewByLabourAndMaterialData,
    getViewBySectionData,
} = require('./viewController')

const getAllProjects = async (req, res, next) => {
    try {
        const projects = await Project.findAll()
        res.json(projects)
    } catch (error) {
        next(error)
    }
}

const getMainProjectInfo = async (jobNo) => {
    try {
        const query = `
            SELECT JobNo, Title, Address
            FROM projects
            WHERE JobNo = :jobNo;
        `
        const projectInfoData = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: { jobNo },
        })

        return projectInfoData[0]
    } catch (error) {
        console.error('Error fetching project info data:', error)
    }
}

const getMainTableData = async (jobNo) => {
    try {
        const query = `
        SELECT Ref, Section , Description, Template,
            ROUND(SUM(LabNorm), 2) AS TotalHours, 
            ROUND(SUM(LabNorm * complete / 100), 2) AS RecoveredHours,
            ROUND((SUM(LabNorm * complete)/SUM(LabNorm)), 2) AS PercentComplete,  
            Area, 
            IFNULL(equipRef, '')
        FROM (
            SELECT equiplists.id, Ref, Section, equiplists.component, LabNorm, complete, 
                    (LabNorm * complete) AS "Rec''d Hrs", 
                    description, Template, Area, inorder
            FROM equiplists
            INNER JOIN components ON equiplists.Component_ID = components.ID AND components.JobNo = :jobNo
            INNER JOIN templates ON equiplists.template = templates.Name AND equiplists.Component_ID = templates.Component_ID AND templates.JobNo = :jobNo
            WHERE equiplists.JobNo = :jobNo
            GROUP BY equiplists.id

            UNION

            SELECT equiplists.id, Ref, Section, cabnum, 
                    (length * LabNorm), cabcomp, 
                    (length * LabNorm) * cabcomp, 
                    description, Template, "Area", "InOrder"
            FROM equiplists
            INNER JOIN cabscheds ON equiplists.Ref = cabscheds.equipRef AND cabscheds.JobNo = :jobNo
            INNER JOIN components ON cabscheds.cabsize = components.name AND components.JobNo = :jobNo
            WHERE equiplists.JobNo = :jobNo
            GROUP BY cabnum

            UNION

            SELECT equiplists.id, Ref, Section, CONCAT(cabnum, " A Gland"), 
                    LabNorm, aglandcomp, 
                    (aglandcomp * LabNorm), 
                    description, Template, "Area", "InOrder"
            FROM equiplists
            INNER JOIN cabscheds ON equiplists.Ref = cabscheds.equipRef AND cabscheds.JobNo = :jobNo
            INNER JOIN components ON CONCAT(cabscheds.cabsize, " Term") = components.name AND components.JobNo = :jobNo
            WHERE equiplists.JobNo = :jobNo
            GROUP BY cabnum

            UNION

            SELECT equiplists.id, Ref, Section, CONCAT(cabnum, " Z Gland"), 
                    LabNorm, zglandcomp, 
                    (LabNorm * zglandcomp), 
                    description, Template, "Area", "InOrder"
            FROM equiplists
            INNER JOIN cabscheds ON equiplists.Ref = cabscheds.equipRef AND cabscheds.JobNo = :jobNo
            INNER JOIN components ON CONCAT(cabscheds.cabsize, " Term") = components.name AND components.JobNo = :jobNo
            WHERE equiplists.JobNo = :jobNo
            GROUP BY cabnum

            UNION
            
            SELECT equiplists.id, Ref, Section, cabnum, LabNorm, 
                    cabtest, (LabNorm * cabtest), 
                    description, Template, "Area", "InOrder"
            FROM equiplists
            INNER JOIN cabscheds ON equiplists.Ref = cabscheds.equipRef AND cabscheds.JobNo = :jobNo
            INNER JOIN components ON CONCAT(cabscheds.cabsize, " Test") = components.name AND components.JobNo = :jobNo
            WHERE equiplists.JobNo = :jobNo
            GROUP BY cabnum
        ) AS Norms
        LEFT JOIN (
            SELECT DISTINCT equipRef, JobNo
            FROM tickCChist 
            WHERE JobNo = :jobNo AND datelift IS NULL
        ) AS CCs
        ON Ref = CCs.equipRef AND CCs.JobNo = :jobNo
        GROUP BY Ref
        ORDER BY Ref;
        `
        const mainTableData = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: { jobNo },
        })

        return mainTableData
    } catch (error) {
        console.error('Error fetching main table data:', error)
    }
}

const getViewTableData = async (jobNo, viewType) => {
    switch (viewType) {
        case 'Area':
            return await getViewByAreaData(jobNo)
        case 'Area-Comp':
            return await getViewByAreaCompData(jobNo)
        case 'Area-Section-Comp':
            return await getViewByAreaSectionCompData(jobNo)
        case 'Labour-Material':
            return await getViewByLabourAndMaterialData(jobNo)
        case 'Section':
            return await getViewBySectionData(jobNo)
        default:
            throw new Error('Invalid viewType')
    }
}

const getSummaryValues = async (jobNo) => {
    let totalTenderHours = 0
    let totalRecoveredHours = 0
    let ddtCableSubConHours = 0
    let globalPercentComplete = 0

    try {
        const mainTableData = await getMainTableData(jobNo)
        if (mainTableData.length > 0) {
            totalTenderHours = mainTableData.reduce(
                (acc, row) => acc + row.TotalHours,
                0
            )
            totalRecoveredHours = mainTableData.reduce(
                (acc, row) => acc + row.RecoveredHours,
                0
            )
            if (totalTenderHours > 0)
                globalPercentComplete =
                    (totalRecoveredHours / totalTenderHours) * 100
        }
    } catch (error) {
        console.error('Error calculating hours or global completion:', error)
    }

    try {
        const ddtCableSubConHoursQuery = `
            SELECT SUM(Length * LabNorm) as total
            FROM cabscheds
            INNER JOIN TickCabBySC 
            ON cabscheds.CabNum = TickCabBySC.CabNum
            AND cabscheds.JobNo = TickCabBySC.JobNo
            INNER JOIN components 
            ON cabscheds.CabSize = components.Name
            WHERE cabscheds.JobNo = :jobNo
            AND TickCabBySC.JobNo = :jobNo
            AND components.JobNo = :jobNo;
        `
        const ddtCableSubConHoursResult = await sequelize.query(
            ddtCableSubConHoursQuery,
            {
                type: QueryTypes.SELECT,
                replacements: { jobNo },
            }
        )
        ddtCableSubConHours = ddtCableSubConHoursResult[0]?.total || 0
    } catch (error) {
        console.error('Error fetching DDT cable sub-con hours:', error)
    }

    const netHoursRecovered = totalRecoveredHours - ddtCableSubConHours

    return {
        totalTenderHours: parseFloat(totalTenderHours.toFixed(2)),
        totalRecoveredHours: parseFloat(totalRecoveredHours.toFixed(2)),
        ddtCableSubConHours: parseFloat(ddtCableSubConHours.toFixed(2)),
        netHoursRecovered: parseFloat(netHoursRecovered.toFixed(2)),
        globalPercentComplete: parseFloat(globalPercentComplete.toFixed(2)),
    }
}

const createNewProject = async (req, res, next) => {
    try {
        const { title, address, number } = req.body

        if (!title || !address || !number) {
            return res.status(400).json({
                message: 'Project Title, Address and Number are required.',
            })
        }

        const newProject = await Project.create({
            Title: title,
            Address: address,
            JobNo: number,
        })

        res.status(201).json(newProject)
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            error.message = 'UNIQUE_CONSTRAINT_ERROR'
        }
        next(error)
    }
}

module.exports = {
    getAllProjects,
    getMainProjectInfo,
    getMainTableData,
    getViewTableData,
    getSummaryValues,
    createNewProject,
}
