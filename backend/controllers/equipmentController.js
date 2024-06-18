const sequelize = require('../config/sequelize')
const { QueryTypes } = require('sequelize')
const {
    Equiplist,
    TickEquipList,
    Template,
    Cabsched,
    Component,
    Revision,
} = require('../models')
const { fetchTemplateComponents } = require('./templateController')
const errorCodes = require('../config/errorCodes')
const {
    equipmentRefPattern,
    equipmentDescriptionPattern,
    equipmentSectionPattern,
    equipmentAreaPattern,
    equipmentCurrentRevisionPattern,
    equipmentTendSectionPattern,
} = require('../config/validation')

const getProjectEquipment = async (req, res, next) => {
    const jobNo = req.params.jobNo

    try {
        const equipmentAndTendSection = await Equiplist.findAll({
            where: {
                jobNo: jobNo,
            },
            include: [
                {
                    model: TickEquipList,
                    where: {
                        jobNo: jobNo,
                    },
                    required: false,
                    attributes: ['TendSection'],
                },
            ],
            group: ['Ref'],
            order: ['Ref'],
        })

        const result = equipmentAndTendSection.map((equip) => {
            const { TickEquipLists, ...restOfEquipData } = equip.dataValues

            const tendSection =
                TickEquipLists && TickEquipLists.length > 0
                    ? TickEquipLists[0].dataValues.TendSection
                    : null

            return {
                ...restOfEquipData,
                TendSection: tendSection,
            }
        })

        res.json(result)
    } catch (error) {
        console.error('Error while fetching the list of equipment: ', error)
        res.status(500).json({ message: errorCodes.GENERIC_ERROR_MESSAGE })
    }
}

//Dialog Box queries for cables in Area-Comp view, depending on the equipment clicked
const QUERY_CONFIGS_AREA_COMP = {
    'Schedule Cable': {
        query: `
        SELECT DISTINCT Ref, CONCAT('Cable No. ', CabNum) AS CabNum,
            ROUND((components.labnorm * length), 3) AS "TotalHours", 
            ROUND((components.labnorm * length * cabcomp) , 3) AS "RecoveredHours", 
            (((components.labnorm * length) * cabcomp) / (components.labnorm * length))   AS PercentComplete
        FROM cabscheds 
            INNER JOIN equiplists ON cabscheds.equipRef = equiplists.Ref AND cabscheds.jobNo = equiplists.jobNo 
            INNER JOIN components ON components.ID = cabscheds.Component_ID AND components.jobNo = equiplists.jobNo 
            INNER JOIN codes ON codes.code = components.code
        WHERE cabscheds.jobNo = :jobNo AND equiplists.Area = :area
        ORDER BY Ref;
        `,
    },
    'Schedule Cable A-Gland': {
        query: `
        SELECT DISTINCT Ref, CONCAT('Cable No. ', CabNum, ' A Gland') AS CabNum, "A Gland Area" AS Component, 
            ROUND(components.labnorm, 3) AS TotalHours, 
            ROUND((components.labnorm * AGlandComp), 3) AS RecoveredHours, 
            ((components.labnorm * AGlandComp) / components.labnorm)   AS PercentComplete
        FROM cabscheds 
            INNER JOIN equiplists ON cabscheds.equipRef = equiplists.Ref AND cabscheds.jobNo = equiplists.jobNo 
            INNER JOIN components ON components.name = CONCAT(cabsize, " Term") AND components.jobNo = equiplists.jobNo 
            INNER JOIN codes ON codes.code = components.code
        WHERE cabscheds.jobNo = :jobNo AND cabscheds.AGlandArea = :area
        ORDER BY Ref;
        `,
    },
    'Schedule Cable Z-Gland': {
        query: `
        SELECT DISTINCT Ref, CONCAT('Cable No. ', CabNum, ' Z Gland') AS CabNum, "Z Gland Area" AS Component, 
            ROUND(components.labnorm, 3) AS TotalHours, 
            ROUND((components.labnorm * ZGlandComp), 3) AS RecoveredHours, 
            ((components.labnorm * ZGlandComp) / components.labnorm)   AS PercentComplete
        FROM cabscheds 
            INNER JOIN equiplists ON cabscheds.equipRef = equiplists.Ref AND cabscheds.jobNo = equiplists.jobNo 
            INNER JOIN components ON components.name = CONCAT(cabsize, " Term") AND components.jobNo = equiplists.jobNo 
            INNER JOIN codes ON codes.code = components.code
        WHERE cabscheds.jobNo = :jobNo AND cabscheds.ZGlandArea = :area
        ORDER BY Ref;   
        `,
    },
    'Schedule Cable Test': {
        query: `
        SELECT DISTINCT Ref, CONCAT('Cable No. ', CabNum, ' Test') AS CabNum, "Cable Test" AS Component, 
            ROUND(components.labnorm, 3) AS TotalHours, 
            ROUND((components.labnorm * cabtest), 3) AS RecoveredHours, 
            ((components.labnorm * cabtest) / components.labnorm)   AS PercentComplete
        FROM cabscheds 
            INNER JOIN equiplists ON cabscheds.equipRef = equiplists.Ref AND cabscheds.jobNo = equiplists.jobNo 
            INNER JOIN components ON components.name = CONCAT(cabsize, " Test") AND components.jobNo = equiplists.jobNo 
            INNER JOIN codes ON codes.code = components.code 
        WHERE cabscheds.jobNo = :jobNo AND equiplists.Area = :area
        ORDER BY Ref;
        `,
    },
}

//Dialog Box queries for cables in Area-Section-Comp view, depending on the equipment clicked
const QUERY_CONFIGS_AREA_SECTION_COMP = {
    'Schedule Cable': {
        query: `
        SELECT DISTINCT Ref, CONCAT('Cable No. ', CabNum) AS CabNum, 
            ROUND((components.labnorm * length), 3) AS "TotalHours", 
            ROUND((components.labnorm * length * cabcomp), 3) AS "RecoveredHours", 
            (((components.labnorm * length) * cabcomp) / (components.labnorm * length))   AS PercentComplete
        FROM cabscheds 
            INNER JOIN equiplists ON cabscheds.equipRef = equiplists.Ref AND cabscheds.jobNo = equiplists.jobNo 
            INNER JOIN components ON components.name = cabsize AND components.jobNo = equiplists.jobNo             INNER JOIN codes ON codes.code = components.code
        WHERE cabscheds.jobNo = :jobNo AND equiplists.Area = :area AND equiplists.Section = :section
        ORDER BY cabnum;
        `,
    },
    'Schedule Cable A-Gland': {
        query: `
        SELECT DISTINCT Ref, CONCAT('Cable No. ', CabNum, ' A Gland') AS CabNum, "A Gland Area" AS Component, 
            ROUND(components.labnorm, 3) AS TotalHours, 
            ROUND((components.labnorm * AGlandComp), 3) AS RecoveredHours, 
            ((components.labnorm * AGlandComp) / components.labnorm)   AS PercentComplete
        FROM cabscheds 
            INNER JOIN equiplists ON cabscheds.equipRef = equiplists.Ref AND cabscheds.jobNo = equiplists.jobNo 
            INNER JOIN components ON components.name = CONCAT(cabsize, " Term") AND components.jobNo = equiplists.jobNo 
        WHERE cabscheds.jobNo = :jobNo AND cabscheds.AGlandArea = :area AND equiplists.Section = :section
        ORDER BY cabnum;
        `,
    },
    'Schedule Cable Z-Gland': {
        query: `
        SELECT DISTINCT Ref, CONCAT('Cable No. ', CabNum, ' Z Gland') AS CabNum, "Z Gland Area" AS Component, 
            ROUND(components.labnorm, 3) AS TotalHours, 
            ROUND((components.labnorm * ZGlandComp), 3) AS RecoveredHours, 
            ((components.labnorm * ZGlandComp) / components.labnorm)   AS PercentComplete
        FROM cabscheds 
            INNER JOIN equiplists ON cabscheds.equipRef = equiplists.Ref AND cabscheds.jobNo = equiplists.jobNo 
            INNER JOIN components ON components.name = CONCAT(cabsize, " Term") AND components.jobNo = equiplists.jobNo 
        WHERE cabscheds.jobNo = :jobNo AND cabscheds.ZGlandArea = :area AND equiplists.Section = :section
        ORDER BY cabnum;

        `,
    },
    'Schedule Cable Test': {
        query: `
        SELECT DISTINCT Ref, CONCAT('Cable No. ', CabNum, ' Test') AS CabNum, "Cable Test" AS Component, 
            ROUND(components.labnorm, 3) AS TotalHours, 
            ROUND((components.labnorm * cabtest), 3) AS RecoveredHours, 
            ((components.labnorm * cabtest) / components.labnorm)   AS PercentComplete
        FROM cabscheds 
            INNER JOIN equiplists ON cabscheds.equipRef = equiplists.Ref AND cabscheds.jobNo = equiplists.jobNo 
            INNER JOIN components ON components.name = CONCAT(cabsize, " Test") AND components.jobNo = equiplists.jobNo 
        WHERE cabscheds.jobNo = :jobNo AND equiplists.Area = :area AND equiplists.Section = :section
        ORDER BY cabnum;
        `,
    },
}

const getEquipmentListByEquipRef = async (jobNo, equipRef) => {
    try {
        const query = `
        SELECT ID, Ref, Component, Code, ROUND(LabNorm, 3) AS "LabNorm", ROUND(Norms.RecHrs / 100, 3) AS "CurrentRecovery", ROUND(Norms.RecHrs/LabNorm  ) AS "PercentComplete", inOrder, Type
        FROM (
            SELECT equiplists.ID, Ref, Section, equiplists.Component, components.Code, LabNorm, Complete, (LabNorm * Complete) AS "RecHrs", Description, templates.inOrder, 'Component' AS Type
            FROM equiplists
            INNER JOIN components ON equiplists.Component_ID = components.ID
            LEFT JOIN templates t1 ON t1.ID = equiplists.Template_ID
            LEFT JOIN templates t2 ON t2.Component_ID = components.ID AND t2.Name = equiplists.Template
            INNER JOIN templates ON templates.ID = COALESCE(t1.ID, t2.ID)
            WHERE equiplists.JobNo = :jobNo AND Ref = :equipRef
            GROUP BY equiplists.ID, Ref, equiplists.Component
        
            UNION
        
            -- Base Cable Component subquery
            SELECT CabNum, equiplists.Ref, equiplists.Section, CONCAT('Cable No. ', CabNum) AS Component, Code, ROUND((Length * LabNorm), 3) AS LabNorm, CabComp, (Length * LabNorm) * CabComp AS "RecHrs", Description, NULL, 'Cable' AS Type
            FROM equiplists
            INNER JOIN cabscheds ON equiplists.Ref = cabscheds.EquipRef AND equiplists.JobNo = cabscheds.JobNo
            INNER JOIN components ON components.Name = cabscheds.CabSize AND equiplists.JobNo = components.JobNo
            WHERE equiplists.JobNo = :jobNo AND equiplists.Ref = :equipRef

            UNION

            -- A Gland Cable Component subquery
            SELECT CONCAT(CabNum, 'A'), equiplists.Ref, equiplists.Section, CONCAT('Cable No. ', CabNum, ' A Gland in Area ', AGlandArea) AS Component, Code, LabNorm, AglandComp, (AglandComp * LabNorm) AS "RecHrs", Description, NULL, 'CableA' AS Type
            FROM equiplists
            INNER JOIN cabscheds ON equiplists.Ref = cabscheds.EquipRef AND equiplists.JobNo = cabscheds.JobNo
            INNER JOIN components ON components.Name = CONCAT(cabscheds.CabSize, " Term") AND equiplists.JobNo = components.JobNo
            WHERE equiplists.JobNo = :jobNo AND equiplists.Ref = :equipRef


            UNION

            -- Z Gland Cable Component subquery
            SELECT CONCAT(CabNum, 'Z'), equiplists.Ref, equiplists.Section, CONCAT('Cable No. ', CabNum, ' Z Gland in Area ', ZGlandArea) AS Component, Code, LabNorm, ZGlandComp, (ZGlandComp * LabNorm) AS "RecHrs", Description, NULL, 'CableZ' AS Type            FROM equiplists
            INNER JOIN cabscheds ON equiplists.Ref = cabscheds.EquipRef AND equiplists.JobNo = cabscheds.JobNo
            INNER JOIN components ON components.Name = CONCAT(cabscheds.CabSize, " Term") AND equiplists.JobNo = components.JobNo
            WHERE equiplists.JobNo = :jobNo AND equiplists.Ref = :equipRef

            UNION

            -- Test Cable Component subquery
            SELECT CONCAT(CabNum, 'T'), equiplists.Ref, equiplists.Section, CONCAT('Cable No. ', CabNum, " Test") AS Component, Code, LabNorm, CabTest, (LabNorm * CabTest) AS "RecHrs", Description, NULL, 'CableT' AS Type
            FROM equiplists
            INNER JOIN cabscheds ON equiplists.Ref = cabscheds.EquipRef AND equiplists.JobNo = cabscheds.JobNo
            INNER JOIN components ON components.Name = CONCAT(cabscheds.CabSize, " Test") AND equiplists.JobNo = components.JobNo
            WHERE equiplists.JobNo = :jobNo AND equiplists.Ref = :equipRef
        ) AS Norms
        GROUP BY ID, Ref, LabNorm, Component, Type
        ORDER BY 
            inOrder,
            CASE 
                WHEN Component LIKE 'Cable No. %' THEN SUBSTRING_INDEX(SUBSTRING_INDEX(Component, ' ', 3), ' ', -1)
                ELSE Component
            END,
            CASE 
                WHEN Component LIKE 'Cable No. %' AND Component NOT LIKE '%Test%' AND Component NOT LIKE '%A Gland%' AND Component NOT LIKE '%Z Gland%' THEN 1
                WHEN Component LIKE 'Cable No. % A Gland%' THEN 2
                WHEN Component LIKE 'Cable No. % Z Gland%' THEN 3
                WHEN Component LIKE 'Cable No. % Test%' THEN 4
                ELSE 5
            END;
        `

        const equipmentList = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: { jobNo, equipRef },
        })

        return equipmentList
    } catch (error) {
        console.error(
            `Error while fetching the list of equipment with the reference ${equipRef}.`,
            error
        )
        throw new Error(errorCodes.GENERIC_ERROR_MESSAGE)
    }
}

const getEquipmentListBySection = async (jobNo, section) => {
    try {
        const query = `
        SELECT Ref, Description, ROUND(SUM(LabNorm), 3) AS TotalHours, ROUND(SUM(CombinedData.RecHrs) / 100, 3) AS RecoveredHours, (SUM(CombinedData.RecHrs)/SUM(LabNorm))   AS PercentComplete
        FROM (
            SELECT Ref, Section, Description, SUM(LabNorm) AS "LabNorm", SUM((LabNorm * Complete)) AS "RecHrs"
            FROM equiplists
            INNER JOIN components ON components.ID = equiplists.Component_ID AND equiplists.JobNo = components.JobNo
            WHERE equiplists.JobNo = :jobNo AND Section = :section
            GROUP BY Ref

            UNION

            SELECT Ref, Section, CONCAT('Cable No. ', CabNum) AS Description, (Length * LabNorm) AS "LabNorm", (Length * LabNorm) * CabComp AS "RecHrs"
            FROM equiplists
            INNER JOIN cabscheds ON equiplists.Ref = cabscheds.equipRef AND equiplists.JobNo = cabscheds.JobNo
            INNER JOIN components ON components.Name = cabscheds.CabSize AND equiplists.JobNo = components.JobNo
            WHERE equiplists.JobNo = :jobNo AND Section = :section
            GROUP BY cabnum

            UNION

            SELECT Ref, Section, CONCAT('Cable No. ', CabNum, ' A Gland in Area ', AGlandArea) AS Description, LabNorm, (AglandComp * LabNorm) AS "RecHrs"
            FROM equiplists
            INNER JOIN cabscheds ON equiplists.Ref = cabscheds.equipRef AND equiplists.JobNo = cabscheds.JobNo
            INNER JOIN components ON components.Name = CONCAT(cabscheds.CabSize, " Term") AND equiplists.JobNo = components.JobNo
            WHERE equiplists.JobNo = :jobNo AND Section = :section
            GROUP BY cabnum

            UNION

            SELECT Ref, Section, CONCAT('Cable No. ', CabNum, ' Z Gland in Area ', ZGlandArea) AS Description, LabNorm, (ZGlandComp * LabNorm) AS "RecHrs"
            FROM equiplists
            INNER JOIN cabscheds ON equiplists.Ref = cabscheds.equipRef AND equiplists.JobNo = cabscheds.JobNo
            INNER JOIN components ON components.Name = CONCAT(cabscheds.CabSize, " Term") AND equiplists.JobNo = components.JobNo
            WHERE equiplists.JobNo = :jobNo AND Section = :section
            GROUP BY cabnum

            UNION

            SELECT Ref, Section, CONCAT('Cable No. ', CabNum, " Test") AS Description, LabNorm, (LabNorm * CabTest) AS "RecHrs"
            FROM equiplists
            INNER JOIN cabscheds ON equiplists.Ref = cabscheds.equipRef AND equiplists.JobNo = cabscheds.JobNo
            INNER JOIN components ON components.Name = CONCAT(cabscheds.CabSize, " Test") AND equiplists.JobNo = components.JobNo
            WHERE equiplists.JobNo = :jobNo AND Section = :section
            GROUP BY cabnum

        ) AS CombinedData
        GROUP BY Ref
        ORDER BY Ref;
        `

        const equipmentList = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: { jobNo, section },
        })

        return equipmentList
    } catch (error) {
        console.error(
            `Error while fetching the list of equipment for section ${section}.`,
            error
        )
        throw new Error(errorCodes.GENERIC_ERROR_MESSAGE)
    }
}

const getEquipmentListByAreaComp = async (jobNo, area, component) => {
    try {
        //Fetch data from the SQL query associated to the type of component clicked (cable, or default)
        const { query } =
            QUERY_CONFIGS_AREA_COMP[component] || getDefaultConfigAreaComp()

        const equipmentList = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: { jobNo, area, component },
        })

        equipmentList.forEach((equip) => {
            equip.RecoveredHours = Number(
                (equip.RecoveredHours / 100).toFixed(3)
            )
            equip.TotalHours = Number(equip.TotalHours.toFixed(3))
        })

        return equipmentList
    } catch (error) {
        console.error(
            `Error while fetching the list of equipment for area ${area} and component ${component}.`,
            error
        )
        throw new Error(errorCodes.GENERIC_ERROR_MESSAGE)
    }
}

const getEquipmentListByAreaSectionComp = async (
    jobNo,
    area,
    section,
    component
) => {
    try {
        //Fetch data from the SQL query associated to the type of component clicked (cable, or default)
        const { query } =
            QUERY_CONFIGS_AREA_SECTION_COMP[component] ||
            getDefaultConfigAreaSectionComp()

        const equipmentList = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: { jobNo, area, section, component },
        })

        equipmentList.forEach((equip) => {
            equip.RecoveredHours = Number(
                (equip.RecoveredHours / 100).toFixed(3)
            )
            equip.TotalHours = Number(equip.TotalHours.toFixed(3))
        })

        return equipmentList
    } catch (error) {
        console.error(
            `Error while fetching the list of equipment for area ${area}, section ${section} and component ${component}.`,
            error
        )
        throw new Error(errorCodes.GENERIC_ERROR_MESSAGE)
    }
}

//Dialog Box query and columns for equipment in Area-Comp view (non-cables)
const getDefaultConfigAreaComp = () => {
    return {
        query: `
        SELECT Ref, Component, codes.Name AS Type, 
            components.labnorm AS TotalHours, 
            components.labnorm * complete AS RecoveredHours, 
            ((components.labnorm * complete) / components.labnorm)   AS PercentComplete
        FROM equiplists 
            INNER JOIN components ON equiplists.Component_ID = components.ID AND equiplists.jobNo = components.jobNo 
            INNER JOIN codes ON components.Code = codes.Code
        WHERE equiplists.jobNo = :jobNo AND equiplists.Area = :area AND codes.Name = :component
        ORDER BY Ref, component;
        `,
    }
}

//Dialog Box query and columns for equipment in Area-Section-Comp view (non-cables)
const getDefaultConfigAreaSectionComp = () => {
    return {
        query: `
        SELECT Ref, Component, codes.Name AS Type, 
            components.labnorm AS TotalHours, 
            components.labnorm * complete AS RecoveredHours, 
            ((components.labnorm * complete) / components.labnorm)   AS PercentComplete
        FROM equiplists 
            INNER JOIN components ON equiplists.Component_ID = components.ID AND equiplists.jobNo = components.jobNo 
            INNER JOIN codes ON components.Code = codes.Code
        WHERE equiplists.jobNo = :jobNo AND equiplists.Area = :area AND equiplists.Section = :section AND codes.Name = :component
        ORDER BY Ref, component;
        `,
    }
}

const getEquipmentRefsDescArea = async (req, res, next) => {
    const jobNo = req.params.jobNo

    try {
        const equipmentRefs = await Equiplist.findAll({
            where: { JobNo: jobNo },
            attributes: ['Ref', 'Description', 'Area'],
            group: ['Ref'],
            order: ['Ref'],
        })

        res.json(equipmentRefs)
    } catch (error) {
        console.error(
            'Error while fetching the list of Equipment Refs-Descriptions-Areas: ',
            error
        )
        res.status(500).json({ message: errorCodes.GENERIC_ERROR_MESSAGE })
    }
}

const getComponentsCodesForASpecificEquipment = async (req, res, next) => {
    const { jobNo, area, section } = req.params

    try {
        const componentCodes = await sequelize.query(
            `
            SELECT DISTINCT codes.Code, codes.Name
            FROM codes
            INNER JOIN components ON components.Code = codes.Code
            INNER JOIN equiplists ON equiplists.Component_ID = components.ID AND equiplists.JobNo = components.JobNo
            WHERE components.JobNo = :jobNo AND equiplists.Area = :area AND equiplists.Section = :section
            ORDER BY codes.Code
        `,
            {
                type: QueryTypes.SELECT,
                replacements: { jobNo, area, section },
            }
        )

        res.json(componentCodes)
    } catch (error) {
        console.error(
            'Error while fetching component codes for equipment: ',
            error
        )
        res.status(500).json({
            message:
                'An error occurred while fetching component codes for equipment.',
        })
    }
}

const getProjectTenderHours = async (req, res, next) => {
    const jobNo = req.params.jobNo

    try {
        const tenderHours = await sequelize.query(
            `
            SELECT 
                EquipRef,
                TendSection,
                Description, 
                Norms.TotalHours
            FROM 
                TickEquipList
            INNER JOIN (
                SELECT Ref, Description, ROUND(SUM(LabNorm), 2) AS TotalHours
                FROM (
                    SELECT Ref, equiplists.component, SUM(LabNorm) AS LabNorm, Description 
                    FROM equiplists
                    INNER JOIN components ON equiplists.Component_ID = components.ID AND components.JobNo = :jobNo
                    INNER JOIN templates ON equiplists.template = templates.Name AND equiplists.Component_ID = templates.Component_ID AND templates.JobNo = :jobNo
                    WHERE equiplists.JobNo = :jobNo
                    GROUP BY equiplists.id

                    UNION

                    SELECT Ref, cabnum, (length * LabNorm), NULL  
                    FROM equiplists
                    INNER JOIN cabscheds ON equiplists.Ref = cabscheds.equipRef AND cabscheds.JobNo = :jobNo
                    INNER JOIN components ON cabscheds.cabsize = components.name AND components.JobNo = :jobNo

                    UNION 

                    SELECT Ref, CONCAT(cabnum, " A Gland"), LabNorm, NULL
                    FROM equiplists
                    INNER JOIN cabscheds ON equiplists.Ref = cabscheds.equipRef AND cabscheds.JobNo = :jobNo
                    INNER JOIN components ON CONCAT(cabscheds.cabsize, " Term") = components.name AND components.JobNo = :jobNo

                    UNION 

                    SELECT Ref, CONCAT(cabnum, " Z Gland"), LabNorm, NULL
                    FROM equiplists
                    INNER JOIN cabscheds ON equiplists.Ref = cabscheds.equipRef AND cabscheds.JobNo = :jobNo
                    INNER JOIN components ON CONCAT(cabscheds.cabsize, " Term") = components.name AND components.JobNo = :jobNo

                    UNION 
                    
                    SELECT Ref, cabnum, LabNorm, NULL
                    FROM equiplists
                    INNER JOIN cabscheds ON equiplists.Ref = cabscheds.equipRef AND cabscheds.JobNo = :jobNo
                    INNER JOIN components ON CONCAT(cabscheds.cabsize, " Test") = components.name AND components.JobNo = :jobNo
                ) AS Norms
                GROUP BY Ref
            ) AS Norms ON TickEquipList.EquipRef = Norms.Ref
            WHERE 
                TickEquipList.JobNo = :jobNo
            GROUP BY EquipRef, TendSection, Description  
            ORDER BY EquipRef;
        `,
            {
                type: sequelize.QueryTypes.SELECT,
                replacements: { jobNo },
            }
        )

        res.status(200).json(tenderHours)
    } catch (error) {
        console.error('Error while fetching the list of Tender Hours: ', error)
        res.status(500).json({ message: errorCodes.GENERIC_ERROR_MESSAGE })
    }
}

const createEquipment = async (req, res, next) => {
    const jobNo = req.params.jobNo
    const { equipmentCreatedOnFileUpload, CurrentRevision } = req.body

    try {
        const {
            Ref,
            Description,
            Section,
            Area,
            Template: templateName,
        } = req.body

        const trimmedDescription = Description.trim()

        if (!Ref || !trimmedDescription || !Section || !Area || !templateName) {
            return res.status(400).json({ message: 'All fields are required.' })
        }

        if (!validateEquipmentData(req.body)) {
            return res.status(400).json({ message: 'Invalid data format.' })
        }

        const existingRef = await Equiplist.findAll({
            where: {
                JobNo: jobNo,
                Ref: Ref,
            },
        })

        if (existingRef.length > 0 && !equipmentCreatedOnFileUpload) {
            return res
                .status(409)
                .json({ message: 'This Equipment already exists.' })
        }

        //Fetch the list of components for the selected Template
        const templateData = await Template.findAll({
            where: { JobNo: jobNo, Name: templateName },
            include: [
                {
                    model: Component,
                    attributes: ['ID', 'Name'],
                },
            ],
        })

        let templateID = templateData[0].ID

        const components = templateData.map((template) => ({
            name: template.dataValues.Component,
            id: template.Component_ID,
        }))

        if (!components || components.length === 0) {
            return res.status(400).json({
                message: 'No components found for the selected template.',
            })
        }

        delete components.equipmentCreatedOnFileUpload

        const newEquipments = []

        const totalHours = await components.reduce(
            async (totalPromise, component) => {
                const total = await totalPromise
                const labNorm = await Component.findOne({
                    where: { id: component.id, JobNo: jobNo },
                    attributes: ['LabNorm'],
                })

                return total + (labNorm ? labNorm.LabNorm : 0)
            },
            Promise.resolve(0)
        )

        for (let { name, id } of components) {
            const newEquipment = await Equiplist.create({
                JobNo: jobNo,
                Ref: Ref,
                Description: trimmedDescription,
                Template: templateName,
                Section: Section,
                Area: Area,
                Component: name,
                Component_ID: id,
                Template_ID: templateID++,
            })
            newEquipments.push(newEquipment)
        }

        newEquipments[0].dataValues.TotalHours = Number(totalHours.toFixed(2))

        const newEquipmentRefs = [
            ...new Set(newEquipments.map((equipment) => equipment.Ref)),
        ]

        for (let equipmentRef of newEquipmentRefs) {
            await TickEquipList.create({
                JobNo: jobNo,
                EquipRef: equipmentRef,
                TendSection: 't.b.a',
            })
        }

        //Update each Equipment in newEquipments array with TendSection value
        for (let equipment of newEquipments) {
            if (equipment.Ref === Ref) {
                equipment.dataValues.TendSection = 't.b.a'
            }
        }

        try {
            await Revision.create({
                JobNo: jobNo,
                Revision: CurrentRevision || 'N/A',
                Item_Ref: Ref,
                Item_Desc: trimmedDescription,
                Notes: 'Equipment created',
                Dated: gmtPlusOneDate(),
            })
        } catch (error) {
            console.error('Error while creating Revision:', error)
        }

        res.status(201).json(newEquipments)
    } catch (error) {
        if (
            error.name === 'SequelizeUniqueConstraintError' ||
            error.message === 'This Equipment already exists.'
        ) {
            return res
                .status(409)
                .json({ message: 'This Equipment already exists.' })
        }
        console.error('Error while creating a new Equipment: ', error)
        res.status(500).json({
            message: 'An error occurred while creating new Equipment.',
        })
    }
}

const bulkCreateEquipment = async (req, res) => {
    const jobNo = req.params.jobNo
    const equipmentsData = req.body

    let results = {
        success: [],
        failures: [],
        existingRefs: [],
    }
    let newRefsCreated = new Set()

    try {
        const processedRefs = new Set()

        for (const equipment of equipmentsData) {
            const {
                Ref,
                Description,
                Section,
                Area,
                Template: templateName,
            } = equipment
            const trimmedDescription = Description.trim()

            if (processedRefs.has(Ref)) {
                continue
            }

            const existingRef = await Equiplist.findOne({
                where: { JobNo: jobNo, Ref: Ref },
            })

            if (existingRef) {
                results.existingRefs.push(Ref)
                results.failures.push({
                    Ref,
                    reason: 'This Equipment Ref already exists.',
                })
                processedRefs.add(Ref)
                continue
            }

            // Fetch the list of components for the selected Template
            const templateData = await Template.findAll({
                where: { JobNo: jobNo, Name: templateName },
                include: [
                    {
                        model: Component,
                        attributes: ['ID', 'Name'],
                    },
                ],
            })

            const components = templateData.map((template) => ({
                name: template.dataValues.Component,
                id: template.Component_ID,
                templateID: template.ID,
            }))

            if (!components || components.length === 0) {
                results.failures.push({
                    Ref,
                    reason: `No components found for the selected template: ${Template}`,
                })
                processedRefs.add(Ref)
                continue
            }

            for (let { name, id, templateID } of components) {
                try {
                    const newEquipment = await Equiplist.create({
                        JobNo: jobNo,
                        Ref: Ref,
                        Description: trimmedDescription,
                        Template: templateName,
                        Section: Section,
                        Area: Area,
                        Component: name,
                        Component_ID: id,
                        Template_ID: templateID,
                    })
                    results.success.push(newEquipment)
                } catch (error) {
                    results.failures.push({
                        Ref: Ref,
                        reason: 'Error creating equipment line.',
                    })
                    break
                }
            }

            if (!results.failures.some((failure) => failure.Ref === Ref)) {
                newRefsCreated.add(Ref)
            }

            processedRefs.add(Ref)
        }

        const uniqueEquipmentCount = newRefsCreated.size

        if (newRefsCreated.size > 0) {
            try {
                await Revision.create({
                    JobNo: jobNo,
                    Revision: 'A0',
                    Item_Ref: 'N/A',
                    Item_Desc: `${uniqueEquipmentCount} Refs created on file upload`,
                    Notes: 'Equipment list created',
                    Dated: gmtPlusOneDate(),
                })
            } catch (error) {
                console.error('Error while creating Revision:', error)
            }
        }

        res.status(200).json({
            ...results,
            uniqueEquipmentCount,
            linesProcessed: equipmentsData.length,
        })
    } catch (error) {
        console.error('Bulk equipment creation failed:', error)
        res.status(500).json({
            message: 'An error occurred during bulk equipment creation.',
        })
    }
}

const updateEquipment = async (req, res, next) => {
    const { jobNo, ref } = req.params
    const decodedRef = decodeURIComponent(ref)

    try {
        const equipment = await Equiplist.findAll({
            where: {
                JobNo: jobNo,
                Ref: decodedRef,
            },
        })
        const correspondingTick = await TickEquipList.findOne({
            where: {
                JobNo: jobNo,
                EquipRef: decodedRef,
            },
        })

        const dataToUpdate = req.body
        dataToUpdate.Description = dataToUpdate.Description.trim()

        if (!validateEquipmentData(dataToUpdate)) {
            return res.status(400).json({ message: 'Invalid data format.' })
        }

        if (dataToUpdate.Template != equipment[0].Template) {
            await Equiplist.destroy({
                where: {
                    JobNo: jobNo,
                    Ref: decodedRef,
                },
            })

            const newTemplate = await Template.findOne({
                where: { JobNo: jobNo, Name: dataToUpdate.Template },
            })

            let newTemplateID = newTemplate.dataValues.ID

            const newComponents = await fetchTemplateComponents(
                jobNo,
                dataToUpdate.Template
            )

            for (let component of newComponents) {
                await Equiplist.create({
                    JobNo: jobNo,
                    Ref: decodedRef,
                    Description: dataToUpdate.Description,
                    Template: dataToUpdate.Template,
                    Component: component.Component,
                    Section: dataToUpdate.Section,
                    Complete: 0,
                    Area: dataToUpdate.Area,
                    Component_ID: component.Component_ID,
                    Template_ID: newTemplateID++,
                })
            }
        }

        const newEquipRef = dataToUpdate.Ref
        const newTendSection = dataToUpdate.TendSection

        if (equipment.length === 0) {
            return res.status(400).json({ message: 'Equipment not found.' })
        }

        if (!correspondingTick) {
            await TickEquipList.create({
                SeqNr: '9999',
                JobNo: jobNo,
                EquipRef: decodedRef,
                TendSection: newTendSection,
            })
        }

        const oldArea = equipment[0].Area
        const newArea = dataToUpdate.Area

        const promises = equipment.map((equip) => equip.update(dataToUpdate))
        const updatedEquipment = await Promise.all(promises)

        if (correspondingTick) {
            await correspondingTick
                .update({
                    EquipRef: newEquipRef,
                    TendSection: newTendSection,
                })
                .catch((e) => console.error(e))
        }

        await Cabsched.update(
            { EquipRef: newEquipRef, ZGlandArea: newArea },
            {
                where: {
                    JobNo: jobNo,
                    EquipRef: decodedRef,
                },
            }
        )

        await Cabsched.update(
            { EquipRef: newEquipRef, AGlandArea: newArea },
            {
                where: {
                    JobNo: jobNo,
                    EquipRef: decodedRef,
                    AGlandArea: oldArea,
                },
            }
        )

        const updatedCabscheds = await Cabsched.findAll({
            where: { JobNo: jobNo, EquipRef: newEquipRef },
        })

        try {
            await Revision.create({
                JobNo: jobNo,
                Revision:
                    req.body.CurrentRevision !== 't.b.a'
                        ? req.body.CurrentRevision
                        : 'N/A',
                Item_Ref:
                    decodedRef !== dataToUpdate.Ref
                        ? `${decodedRef} -> ${dataToUpdate.Ref}`
                        : dataToUpdate.Ref,
                Item_Desc: dataToUpdate.Description,
                Notes: 'Equipment updated',
                Dated: gmtPlusOneDate(),
            })
        } catch (error) {
            console.error('Error while creating Revision:', error)
        }

        res.status(200).json({ updatedEquipment, updatedCabscheds })
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res
                .status(409)
                .json({ message: 'This Equipment already exists.' })
        }
        console.error('Error while editing the Equipment: ', error)
        res.status(500).json({
            message: 'An error occurred while editing the Equipment.',
        })
    }
}

const bulkUpdateEquipment = async (req, res) => {
    const { jobNo } = req.params
    const dataToUpdate = req.body

    if (!Array.isArray(dataToUpdate) || dataToUpdate.length === 0) {
        return res.status(400).json({
            message: 'Request body should be a non-empty array.',
        })
    }

    let updatedEquipmentListsArrays = []
    let updatedCabschedsArrays = []
    let updatedRefsArray = []
    let errorMessages = []

    try {
        for (const updateItem of dataToUpdate) {
            const { Ref, ...updateFields } = updateItem
            const decodedRef = decodeURIComponent(Ref)
            let [fieldToUpdate, newValue] = Object.entries(updateFields)[0]

            fieldToUpdate = fieldMapping[fieldToUpdate] || fieldToUpdate

            if (!fieldToUpdate || newValue === undefined) {
                const errorMessage = `Missing required fields for update in reference ${decodedRef}.`
                console.error(errorMessage)
                errorMessages.push(errorMessage)
                continue
            }

            const equipmentList = await Equiplist.findAll({
                where: { JobNo: jobNo, Ref: decodedRef },
            })

            if (!equipmentList || equipmentList.length === 0) {
                const errorMessage = `Equipment not found for Ref: ${decodedRef}`
                console.error(errorMessage)
                errorMessages.push(errorMessage)
                continue
            }

            const updatePromises = equipmentList.map((equipment) => {
                if (equipment[fieldToUpdate] !== newValue) {
                    equipment[fieldToUpdate] = newValue
                    return equipment
                        .save()
                        .then(() => updatedRefsArray.push(decodedRef))
                }
                return Promise.resolve()
            })

            await Promise.all(updatePromises)

            if (fieldToUpdate === 'Area') {
                await Cabsched.update(
                    { AGlandArea: newValue },
                    {
                        where: {
                            JobNo: jobNo,
                            EquipRef: decodedRef,
                            AGlandArea: equipmentList[0].Area,
                        },
                    }
                )
                await Cabsched.update(
                    { ZGlandArea: newValue },
                    {
                        where: {
                            JobNo: jobNo,
                            EquipRef: decodedRef,
                        },
                    }
                )
            }

            if (fieldToUpdate === 'Ref') {
                await Cabsched.update(
                    { EquipRef: newValue },
                    {
                        where: {
                            JobNo: jobNo,
                            EquipRef: decodedRef,
                        },
                    }
                )

                await TickEquipList.update(
                    { EquipRef: newValue },
                    {
                        where: {
                            JobNo: jobNo,
                            EquipRef: decodedRef,
                        },
                    }
                )
                const updatedEquipment = await Equiplist.findOne({
                    where: { JobNo: jobNo, Ref: newValue },
                })
                updatedEquipmentListsArrays.push(updatedEquipment)
            } else {
                const updatedEquipment = await Equiplist.findOne({
                    where: { JobNo: jobNo, Ref: decodedRef },
                })
                updatedEquipmentListsArrays.push(updatedEquipment)
            }

            const cabschedsList = await Cabsched.findAll({
                where: { JobNo: jobNo, EquipRef: decodedRef },
            })

            if (cabschedsList.length > 0) {
                updatedCabschedsArrays.push(cabschedsList)
            }
        }

        const updatedCabscheds = updatedCabschedsArrays.flat()
        const updatedEquipmentLists = updatedEquipmentListsArrays.filter(
            (equip) => updatedRefsArray.includes(equip.Ref)
        )

        try {
            await Revision.create({
                JobNo: jobNo,
                Revision: 'N/A',
                Item_Ref: 'N/A',
                Item_Desc: `${updatedEquipmentLists.length} Refs updated on file upload`,
                Notes: 'Equipment list updated',
                Dated: gmtPlusOneDate(),
            })
        } catch (error) {
            console.error('Error while creating Revision:', error)
        }

        return res.status(200).json({
            updatedEquipmentLists,
            updatedCabscheds,
            updatedRefsArray,
            errorMessages,
            message:
                updatedRefsArray.length > 0
                    ? 'Equipment list updated successfully.'
                    : 'No Equipment to update.',
        })
    } catch (error) {
        console.error('Error while bulk updating equipment:', error)
        return res
            .status(500)
            .json({ message: 'Error while updating equipment.' })
    }
}

const updateEquipRecoveryAndCompletion = async (req, res, next) => {
    const { jobNo, id } = req.params
    const decodedId = decodeURIComponent(id)

    let itemToUpdate
    let dataToUpdate = req.body

    if (dataToUpdate.Type === 'Component') {
        itemToUpdate = await Equiplist.findOne({
            where: {
                id: decodedId,
                JobNo: jobNo,
            },
        })

        if (!itemToUpdate) {
            return res.status(400).json({ message: 'Equipment not found.' })
        }
    } else {
        itemToUpdate = await Cabsched.findOne({
            where: {
                JobNo: jobNo,
                CabNum: decodedId,
            },
        })
        if (!itemToUpdate) {
            return res.status(400).json({ message: 'Cable not found.' })
        }
    }

    try {
        const updatedItem = await itemToUpdate.update(dataToUpdate)

        //Map Completion fields of cables to PercentComplete for frontend dynamic update
        if (dataToUpdate.Type !== 'Component') {
            updatedItem.dataValues.PercentComplete =
                updatedItem.dataValues.CabComp ||
                updatedItem.dataValues.AGlandComp ||
                updatedItem.dataValues.ZGlandComp ||
                updatedItem.dataValues.CabTest
        }

        const recalculatedData = await sequelize.query(
            `SELECT Ref, Section , Description, Template,
            ROUND(SUM(LabNorm), 2) AS TotalHours, 
            ROUND(SUM(LabNorm * complete) / 100, 2) AS RecoveredHours,
            ROUND((SUM(LabNorm * complete)/SUM(LabNorm)), 2)   AS PercentComplete,  
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
        WHERE Norms.Ref = :updatedRef
        GROUP BY Ref
        ORDER BY Ref;`,
            {
                replacements: { jobNo: jobNo, updatedRef: dataToUpdate.Ref },
                type: sequelize.QueryTypes.SELECT,
            }
        )

        const recalculatedRow = recalculatedData.find(
            (item) => item.Ref === dataToUpdate.Ref
        )

        res.status(200).json({
            updatedItem: updatedItem.dataValues,
            recalculatedRow: recalculatedRow,
        })
    } catch (error) {
        console.error('Error while editing the item:', error)
        res.status(500).json({
            message: 'An error occurred while editing the item.',
        })
    }
}

const bulkUpdateEquipmentCompletionByCodes = async (req, res, next) => {
    const { jobNo } = req.params
    const { selectedRefs, updatedCodes } = req.body

    let updatedRefs = new Set()

    try {
        const componentsToUpdate = await sequelize.query(
            `
            SELECT components.*, equiplists.Ref
            FROM components
            JOIN equiplists ON equiplists.Component_ID = components.ID
            WHERE equiplists.JobNo = :jobNo
            AND equiplists.Ref IN (:selectedRefs)
            AND components.Code IN (:codes)
        `,
            {
                replacements: {
                    jobNo,
                    selectedRefs,
                    codes: updatedCodes.map((code) => code.Code),
                },
                type: sequelize.QueryTypes.SELECT,
            }
        )

        for (const component of componentsToUpdate) {
            const { Code, Ref } = component
            const updatedCode = updatedCodes.find((item) => item.Code === Code)
            const updatedRef = selectedRefs.find((item) => item === Ref)
            if (updatedCode) {
                await Equiplist.update(
                    { Complete: updatedCode.PercentComplete },
                    { where: { Ref: updatedRef, Component_ID: component.id } }
                )
                updatedRefs.add(updatedRef)
            }
        }

        const updatedRefsArray = Array.from(updatedRefs)

        try {
            if (updatedRefsArray.length > 0) {
                const recalculatedData = await sequelize.query(
                    `SELECT Ref, Section, Description, Template,
                    ROUND(SUM(LabNorm), 2) AS TotalHours, 
                    ROUND(SUM(LabNorm * complete) / 100, 2) AS RecoveredHours,
                    ROUND((SUM(LabNorm * complete)/SUM(LabNorm)), 2) AS PercentComplete,  
                    Area, 
                    IFNULL(equipRef, '')
                FROM (
                    SELECT Ref, Section, equiplists.component, LabNorm, complete, 
                            (LabNorm * complete) AS "Rec''d Hrs", 
                            description, Template, Area, inorder
                    FROM equiplists
                    INNER JOIN components ON equiplists.Component_ID = components.ID AND components.JobNo = :jobNo
                    INNER JOIN templates ON equiplists.template = templates.Name AND equiplists.Component_ID = templates.Component_ID AND templates.JobNo = :jobNo
                    WHERE equiplists.JobNo = :jobNo
    
                    UNION
    
                    SELECT Ref, Section, cabnum, 
                            (length * LabNorm), cabcomp, 
                            (length * LabNorm) * cabcomp, 
                            description, Template, "Area", "InOrder"
                    FROM equiplists
                    INNER JOIN cabscheds ON equiplists.Ref = cabscheds.equipRef AND cabscheds.JobNo = :jobNo
                    INNER JOIN components ON cabscheds.cabsize = components.name AND components.JobNo = :jobNo
                    WHERE equiplists.JobNo = :jobNo
                    GROUP BY cabnum
    
                    UNION
    
                    SELECT Ref, Section, CONCAT(cabnum, " A Gland"), 
                            LabNorm, aglandcomp, 
                            (aglandcomp * LabNorm), 
                            description, Template, "Area", "InOrder"
                    FROM equiplists
                    INNER JOIN cabscheds ON equiplists.Ref = cabscheds.equipRef AND cabscheds.JobNo = :jobNo
                    INNER JOIN components ON CONCAT(cabscheds.cabsize, " Term") = components.name AND components.JobNo = :jobNo
                    WHERE equiplists.JobNo = :jobNo
                    GROUP BY cabnum
    
                    UNION
    
                    SELECT Ref, Section, CONCAT(cabnum, " Z Gland"), 
                            LabNorm, zglandcomp, 
                            (LabNorm * zglandcomp), 
                            description, Template, "Area", "InOrder"
                    FROM equiplists
                    INNER JOIN cabscheds ON equiplists.Ref = cabscheds.equipRef AND cabscheds.JobNo = :jobNo
                    INNER JOIN components ON CONCAT(cabscheds.cabsize, " Term") = components.name AND components.JobNo = :jobNo
                    WHERE equiplists.JobNo = :jobNo
                    GROUP BY cabnum
    
                    UNION
                    
                    SELECT Ref, Section, cabnum, LabNorm, 
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
                WHERE Norms.Ref IN (:updatedRefs)
                GROUP BY Ref
                ORDER BY Ref;`,
                    {
                        replacements: {
                            jobNo: jobNo,
                            updatedRefs: Array.from(updatedRefs),
                        },
                        type: sequelize.QueryTypes.SELECT,
                    }
                )

                let recalculatedDataForUpdatedRefs = []

                updatedRefsArray.forEach((updatedRef) => {
                    const dataForRef = recalculatedData.filter(
                        (item) => item.Ref === updatedRef
                    )

                    recalculatedDataForUpdatedRefs.push(...dataForRef)
                })

                res.status(200).json({
                    updatedItems: recalculatedDataForUpdatedRefs,
                })
            } else {
                res.status(204).json({
                    message: 'No items updated.',
                })
            }
        } catch (error) {
            console.error('Error fetching updated Equipment details:', error)
            res.status(500).json({
                message: 'Failed to fetch updated Equipment details.',
            })
        }
    } catch (error) {
        console.error('Error updating Equipment:', error)
        res.status(500).json({
            message: 'Failed to update Equipment.',
        })
    }
}

const bulkUpdateEquipmentCompletionByComponents = async (req, res, next) => {
    const { jobNo } = req.params
    const { updates } = req.body

    const updatedEquipments = []
    const updatedCabschedsMap = {}

    try {
        for (const update of updates) {
            const { id, percentComplete, type } = update
            const decodedId = decodeURIComponent(id)
            let itemToUpdate

            if (type === 'Component') {
                itemToUpdate = await Equiplist.findOne({
                    where: {
                        id: decodedId,
                        JobNo: jobNo,
                    },
                })

                if (!itemToUpdate) {
                    return res
                        .status(400)
                        .json({ message: 'Equipment not found.' })
                }

                const updatedItem = await itemToUpdate.update({
                    Complete: percentComplete,
                })
                updatedEquipments.push(updatedItem)
            } else {
                itemToUpdate = await Cabsched.findOne({
                    where: {
                        JobNo: jobNo,
                        CabNum: decodedId,
                    },
                })

                if (!itemToUpdate) {
                    return res.status(400).json({ message: 'Cable not found.' })
                }

                const fieldMap = {
                    Cable: 'CabComp',
                    CableA: 'AGlandComp',
                    CableZ: 'ZGlandComp',
                    CableT: 'CabTest',
                }

                const updateData = {}
                updateData[fieldMap[type]] = percentComplete

                const updatedItem = await itemToUpdate.update(updateData)

                if (!updatedCabschedsMap[updatedItem.CabNum]) {
                    updatedCabschedsMap[updatedItem.CabNum] = {
                        ...updatedItem.dataValues,
                    }
                } else {
                    updatedCabschedsMap[updatedItem.CabNum] = {
                        ...updatedCabschedsMap[updatedItem.CabNum],
                        ...updatedItem.dataValues,
                    }
                }
            }
        }

        const updatedCabscheds = Object.values(updatedCabschedsMap)

        // Recalculate the data after bulk update
        const recalculatedData = await sequelize.query(
            `SELECT Ref, Section, Description, Template,
            ROUND(SUM(LabNorm), 2) AS TotalHours, 
            ROUND(SUM(LabNorm * complete) / 100, 2) AS RecoveredHours,
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
        WHERE Norms.Ref IN (:updatedRefs)
        GROUP BY Ref
        ORDER BY Ref;`,
            {
                replacements: {
                    jobNo,
                    updatedRefs: updates.map((u) => u.ref),
                },
                type: sequelize.QueryTypes.SELECT,
            }
        )

        res.status(200).json({
            recalculatedRow: recalculatedData,
            updatedEquipments,
            updatedCabscheds,
        })
    } catch (error) {
        console.error('Error updating Equipment:', error)
        res.status(500).json({
            message: 'Failed to update Equipment.',
        })
    }
}

const deleteEquipment = async (req, res, next) => {
    const { jobNo, ref } = req.params
    const { deleteAssociatedCables } = req.body

    const decodedRef = decodeURIComponent(ref)

    if (!jobNo || !ref) throw new Error('jobNo or ref is not provided')

    try {
        const equipment = await Equiplist.findAll({
            where: {
                Ref: decodedRef,
                JobNo: jobNo,
            },
        })

        const correspondingTick = await TickEquipList.findOne({
            where: {
                JobNo: jobNo,
                EquipRef: decodedRef,
            },
        })

        if (equipment.length === 0) {
            return res.status(400).json({ message: 'Equipment not found.' })
        }

        await Equiplist.destroy({
            where: {
                Ref: decodedRef,
                JobNo: jobNo,
            },
        })

        if (correspondingTick) {
            await TickEquipList.destroy({
                where: {
                    EquipRef: decodedRef,
                    JobNo: jobNo,
                },
            })
        }

        let deletedCabscheds = []
        if (deleteAssociatedCables) {
            const cablesToDelete = await Cabsched.findAll({
                where: {
                    EquipRef: decodedRef,
                    JobNo: jobNo,
                },
            })

            deletedCabscheds = cablesToDelete

            await Cabsched.destroy({
                where: {
                    EquipRef: decodedRef,
                    JobNo: jobNo,
                },
            })
        }

        try {
            await Revision.create({
                JobNo: jobNo,
                Revision: 'N/A',
                Item_Ref: equipment[0].Ref,
                Item_Desc: equipment[0].Description,
                Notes: 'Equipment deleted',
                Dated: gmtPlusOneDate(),
            })
        } catch (error) {
            console.error('Error while creating Revision:', error)
        }

        res.status(200).json({
            message: 'Equipment successfully deleted!',
            deletedCabscheds: deletedCabscheds,
        })
    } catch (error) {
        console.error('Error while deleting the Equipment: ', error)
        res.status(500).json({ message: errorCodes.GENERIC_ERROR_MESSAGE })
    }
}

const validateEquipmentData = (data) => {
    const isValidEquipRef = equipmentRefPattern.test(data.Ref)
    const isValidDescription = equipmentDescriptionPattern.test(
        data.Description
    )
    const isValidSection = equipmentSectionPattern.test(data.Section)
    const isValidArea = equipmentAreaPattern.test(data.Area)

    let isValidRevision = true
    let isValidTendSection = true

    if (data.CurrentRevision)
        isValidRevision = equipmentCurrentRevisionPattern.test(
            data.CurrentRevision
        )
    if (data.TendSection)
        isValidTendSection = equipmentTendSectionPattern.test(data.TendSection)

    return (
        isValidEquipRef &&
        isValidDescription &&
        isValidSection &&
        isValidArea &&
        isValidTendSection &&
        isValidRevision
    )
}

const fieldMapping = {
    Section: 'Section',
    Area: 'Area',
    Ref_1: 'Ref',
}

const gmtPlusOneDate = () => {
    const currentDate = new Date()

    // Convert to GMT+1 by adding one hour to the current UTC time
    return new Date(currentDate.getTime() + 60 * 60 * 100)
}

module.exports = {
    getProjectEquipment,
    getEquipmentListByEquipRef,
    getEquipmentListBySection,
    getEquipmentListByAreaComp,
    getEquipmentListByAreaSectionComp,
    getEquipmentRefsDescArea,
    getComponentsCodesForASpecificEquipment,
    getProjectTenderHours,
    createEquipment,
    bulkCreateEquipment,
    updateEquipment,
    bulkUpdateEquipment,
    updateEquipRecoveryAndCompletion,
    bulkUpdateEquipmentCompletionByCodes,
    bulkUpdateEquipmentCompletionByComponents,
    deleteEquipment,
}
