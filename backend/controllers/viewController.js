const sequelize = require('../config/sequelize')
const { QueryTypes } = require('sequelize')

const getViewByAreaData = async (jobNo) => {
    const query = `
    SELECT Area, ROUND(SUM(TotalHours), 2) AS TotalHours, ROUND(SUM(RecoveredHours), 2) AS RecoveredHours, ROUND((SUM(RecoveredHours)/SUM(TotalHours)) * 100) AS PercentComplete
    FROM (
        SELECT tendid AS Area, equiplists.progid, codes.name, SUM(components.labnorm) AS TotalHours,
        SUM(components.labnorm * complete) AS RecoveredHours
        FROM equiplists
        INNER JOIN components ON equiplists.Component_ID = components.ID AND components.jobNo = :jobNo
        INNER JOIN codes ON components.code = codes.code 
        WHERE codes.name <> 'Blank' AND codes.name <> 'Title' AND equiplists.jobNo = :jobNo AND components.jobNo = :jobNo
        GROUP BY Area, progid, name

        UNION

        SELECT AGlandArea AS Area, progid, 'Schedule Cable A-Gland' AS Name, SUM(Hrs) AS TotalHours, SUM(ARec) AS RecoveredHours
        FROM (
            SELECT DISTINCT cabscheds.AGlandArea, equiplists.progid, codes.name, components.labnorm AS Hrs, components.labnorm * AGlandComp AS ARec
            FROM cabscheds
            INNER JOIN equiplists ON cabscheds.equipref = equiplists.ref
            INNER JOIN components ON components.name = concat(cabsize, ' Term')
            INNER JOIN codes ON components.code = codes.code
            WHERE codes.name <> 'Blank' AND codes.name <> 'Title' AND cabscheds.jobNo = :jobNo AND equiplists.jobNo = :jobNo AND components.jobNo = :jobNo
            ORDER BY AGlandArea
        ) AS AGlandHrs
        GROUP BY Area, progid

        UNION

        SELECT ZGlandArea AS Area, progid, 'Schedule Cable Z-Gland' AS Name, SUM(Hrs) AS TotalHours, SUM(ZRec) AS RecoveredHours
        FROM (
            SELECT DISTINCT cabscheds.ZGlandArea, equiplists.progid, codes.name, components.labnorm AS Hrs, components.labnorm * ZGlandComp AS ZRec
            FROM cabscheds
            INNER JOIN equiplists ON cabscheds.equipref = equiplists.ref
            INNER JOIN components ON components.name = concat(cabsize, ' Term')
            INNER JOIN codes ON components.code = codes.code
            WHERE codes.name <> 'Blank' AND codes.name <> 'Title' AND cabscheds.jobNo = :jobNo AND equiplists.jobNo = :jobNo AND components.jobNo = :jobNo
            ORDER BY ZGlandArea
        ) AS ZGlandHrs
        GROUP BY Area, progid

        UNION

        SELECT TendID AS Area, progid, 'Schedule Cable Test' AS Name, SUM(Hrs) AS TotalHours, SUM(ZRec) AS RecoveredHours
        FROM (
            SELECT DISTINCT equiplists.TendID, equiplists.progid, codes.name, components.labnorm AS Hrs, components.labnorm * CabTest AS ZRec
            FROM cabscheds
            INNER JOIN equiplists ON cabscheds.equipref = equiplists.ref
            INNER JOIN components ON components.name = concat(cabsize, ' Test')
            INNER JOIN codes ON components.code = codes.code
            WHERE codes.name <> 'Blank' AND codes.name <> 'Title' AND cabscheds.jobNo = :jobNo AND equiplists.jobNo = :jobNo AND components.jobNo = :jobNo
            ORDER BY TendID
        ) AS CabTestHrs
        GROUP BY Area, progid

        UNION

        SELECT TendID AS Area, progid AS Section, Name, SUM(hrs) AS TotalHours, SUM(RecoveredHoursHrs) AS RecoveredHours
        FROM (
            SELECT DISTINCT equiplists.TendID, equiplists.progid, codes.name AS Name, components.labnorm * length AS Hrs, (components.labnorm * length) * cabcomp AS RecoveredHoursHrs
            FROM cabscheds
            INNER JOIN equiplists ON cabscheds.equipref = equiplists.ref
            INNER JOIN components ON components.name = cabsize
            INNER JOIN codes ON components.code = codes.code
            WHERE codes.name <> 'Blank' AND codes.name <> 'Title' AND cabscheds.jobNo = :jobNo AND equiplists.jobNo = :jobNo AND components.jobNo = :jobNo
            ORDER BY tendid
        ) AS CabHrs
        GROUP BY Area, progid
    ) AS test
    GROUP BY Area
    ORDER BY Area;    
    `
    const viewByAreaData = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { jobNo },
    })

    return viewByAreaData
}

const getViewByAreaCompData = async (jobNo) => {
    const query = `
    SELECT 
        Area, 
        Name AS Component, 
        ROUND(SUM(TotalHours), 2) as TotalHours, 
        ROUND(SUM(RecoveredHours), 2) as RecoveredHours, 
        ROUND((SUM(RecoveredHours) / SUM(TotalHours)) * 100, 2) AS PercentComplete
    FROM (
        SELECT 
            tendid AS Area, 
            codes.name AS Name, 
            SUM(components.labnorm) AS TotalHours, 
            SUM(components.labnorm * complete) AS RecoveredHours, 
            equiplists.Ref, 
            equiplists.Component 
        FROM equiplists 
        INNER JOIN components ON equiplists.Component_ID = components.ID AND equiplists.jobNo = components.jobNo
        INNER JOIN codes ON components.code = codes.code 
        WHERE codes.name <> 'Blank' AND codes.name <> 'Title' AND equiplists.jobNo = :jobNo AND components.jobNo = :jobNo
        GROUP BY Area, Name 

        UNION 

        SELECT 
            AGlandArea AS Area, 
            'Schedule Cable A-Gland' AS Name, 
            SUM(LabNorm) AS TotalHours, 
            SUM(RecoveredHours) AS RecoveredHours, 
            cabnum, 
            equipref
        FROM (
            SELECT DISTINCT 
                cabscheds.AGlandArea, 
                compTerm.labnorm AS LabNorm, 
                compTerm.labnorm * cabscheds.AGlandComp AS RecoveredHours, 
                cabnum, 
                equipref
            FROM cabscheds
            INNER JOIN equiplists ON cabscheds.equipRef = equiplists.Ref AND cabscheds.jobNo = equiplists.jobNo
            INNER JOIN components baseComp ON baseComp.ID = cabscheds.Component_ID AND baseComp.jobNo = cabscheds.jobNo
            LEFT JOIN components compTerm ON compTerm.jobNo = cabscheds.jobNo AND compTerm.Name = CONCAT(baseComp.Name, ' Term')
            WHERE cabscheds.jobNo = :jobNo
        ) AS AGlandHrs 
        GROUP BY AGlandArea, cabnum, equipref

        UNION 

        SELECT 
            ZGlandArea AS Area, 
            'Schedule Cable Z-Gland' AS Name, 
            SUM(LabNorm) AS TotalHours, 
            SUM(RecoveredHours) AS RecoveredHours, 
            cabnum, 
            equipref
        FROM (
            SELECT DISTINCT 
                cabscheds.ZGlandArea, 
                compTerm.labnorm AS LabNorm, 
                compTerm.labnorm * cabscheds.ZGlandComp AS RecoveredHours, 
                cabnum, 
                equipref
            FROM cabscheds
            INNER JOIN equiplists ON cabscheds.equipRef = equiplists.Ref AND cabscheds.jobNo = equiplists.jobNo
            INNER JOIN components baseComp ON baseComp.ID = cabscheds.Component_ID AND baseComp.jobNo = cabscheds.jobNo
            LEFT JOIN components compTerm ON compTerm.jobNo = cabscheds.jobNo AND compTerm.Name = CONCAT(baseComp.Name, ' Term')
            WHERE cabscheds.jobNo = :jobNo
        ) AS ZGlandHrs 
        GROUP BY ZGlandArea, cabnum, equipref

        UNION 

        SELECT 
            TendID AS Area, 
            'Schedule Cable' AS Name, 
            SUM(Hrs) AS TotalHours, 
            SUM(RecoveredHours) AS RecoveredHours, 
            cabnum, 
            equipref
        FROM (
            SELECT DISTINCT 
                equiplists.TendID, 
                (components.labnorm * cabscheds.Length) AS Hrs, 
                (components.labnorm * cabscheds.Length * cabscheds.CabComp) AS RecoveredHours, 
                cabnum, 
                equipref
            FROM cabscheds 
            INNER JOIN equiplists ON cabscheds.EquipRef = equiplists.Ref 
            INNER JOIN components ON components.ID = cabscheds.Component_ID 
            WHERE cabscheds.jobNo = :jobNo AND equiplists.jobNo = :jobNo AND components.jobNo = :jobNo
        ) AS CabHrs 
        GROUP BY Area, cabnum, equipref

        UNION 

        SELECT 
            TendID AS Area, 
            'Schedule Cable Test' AS Name, 
            SUM(Hrs) AS TotalHours, 
            SUM(RecoveredHours) AS RecoveredHours, 
            cabnum, 
            equipref
        FROM (
            SELECT DISTINCT 
                equiplists.TendID, 
                compTest.labnorm AS Hrs, 
                compTest.labnorm * cabscheds.CabTest AS RecoveredHours, 
                cabnum, 
                equipref
            FROM cabscheds 
            INNER JOIN equiplists ON cabscheds.EquipRef = equiplists.Ref 
            INNER JOIN components baseComp ON baseComp.ID = cabscheds.Component_ID 
            LEFT JOIN components compTest ON compTest.jobNo = equiplists.jobNo AND compTest.Name = CONCAT(baseComp.Name, ' Test')
            WHERE cabscheds.jobNo = :jobNo AND equiplists.jobNo = :jobNo AND compTest.jobNo = :jobNo
        ) AS TestHrs 
        GROUP BY Area, cabnum, equipref
    ) AS test 
    GROUP BY Area, Name 
    ORDER BY Area, Name;
    `

    const viewByAreaCompData = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { jobNo },
    })

    return viewByAreaCompData
}

const getViewByAreaSectionCompData = async (jobNo) => {
    const query = `
    SELECT 
        Area, 
        progid AS Section, 
        Name AS Component, 
        ROUND(SUM(TotalHours), 2) as TotalHours, 
        ROUND(SUM(RecoveredHours), 2) as RecoveredHours, 
        ROUND((SUM(RecoveredHours) / SUM(TotalHours)) * 100, 2) AS PercentComplete
    FROM (
        SELECT 
            tendid AS Area, 
            progid, 
            codes.name AS Name, 
            SUM(components.labnorm) AS TotalHours, 
            SUM(components.labnorm * complete) AS RecoveredHours, 
            equiplists.Ref, 
            equiplists.Component 
        FROM equiplists 
        INNER JOIN components ON equiplists.Component_ID = components.ID AND equiplists.jobNo = components.jobNo
        INNER JOIN codes ON components.code = codes.code 
        WHERE codes.name <> 'Blank' AND codes.name <> 'Title' AND equiplists.jobNo = :jobNo AND components.jobNo = :jobNo
        GROUP BY Area, equiplists.progid, Name 

        UNION 

        SELECT 
            AGlandArea AS Area, 
            progid, 
            'Schedule Cable A-Gland' AS Name, 
            SUM(LabNorm) AS TotalHours, 
            SUM(RecoveredHours) AS RecoveredHours, 
            cabnum, 
            equipref
        FROM (
            SELECT DISTINCT 
                cabscheds.AGlandArea, 
                equiplists.progid, 
                compTerm.labnorm AS LabNorm, 
                compTerm.labnorm * cabscheds.AGlandComp AS RecoveredHours, 
                cabnum, 
                equipref
            FROM cabscheds
            INNER JOIN equiplists ON cabscheds.equipRef = equiplists.Ref AND cabscheds.jobNo = equiplists.jobNo
            INNER JOIN components baseComp ON baseComp.ID = cabscheds.Component_ID AND baseComp.jobNo = cabscheds.jobNo
            LEFT JOIN components compTerm ON compTerm.jobNo = cabscheds.jobNo AND compTerm.Name = CONCAT(baseComp.Name, ' Term')
            WHERE cabscheds.jobNo = :jobNo
        ) AS AGlandHrs 
        GROUP BY AGlandArea, progid, cabnum, equipref

        UNION 

        SELECT 
            ZGlandArea AS Area, 
            progid, 
            'Schedule Cable Z-Gland' AS Name, 
            SUM(LabNorm) AS TotalHours, 
            SUM(RecoveredHours) AS RecoveredHours, 
            cabnum, 
            equipref
        FROM (
            SELECT DISTINCT 
                cabscheds.ZGlandArea, 
                equiplists.progid, 
                compTerm.labnorm AS LabNorm, 
                compTerm.labnorm * cabscheds.ZGlandComp AS RecoveredHours, 
                cabnum, 
                equipref
            FROM cabscheds
            INNER JOIN equiplists ON cabscheds.equipRef = equiplists.Ref AND cabscheds.jobNo = equiplists.jobNo
            INNER JOIN components baseComp ON baseComp.ID = cabscheds.Component_ID AND baseComp.jobNo = cabscheds.jobNo
            LEFT JOIN components compTerm ON compTerm.jobNo = cabscheds.jobNo AND compTerm.Name = CONCAT(baseComp.Name, ' Term')
            WHERE cabscheds.jobNo = :jobNo
        ) AS ZGlandHrs 
        GROUP BY ZGlandArea, progid, cabnum, equipref

        UNION 

        SELECT 
            TendID AS Area, 
            progid AS Section, 
            'Schedule Cable' AS Name, 
            SUM(Hrs) AS TotalHours, 
            SUM(RecoveredHours) AS RecoveredHours, 
            cabnum, 
            equipref
        FROM (
            SELECT DISTINCT 
                equiplists.TendID, 
                equiplists.progid, 
                (components.labnorm * cabscheds.Length) AS Hrs, 
                (components.labnorm * cabscheds.Length * cabscheds.CabComp) AS RecoveredHours, 
                cabnum, 
                equipref
            FROM cabscheds 
            INNER JOIN equiplists ON cabscheds.EquipRef = equiplists.Ref 
            INNER JOIN components ON components.ID = cabscheds.Component_ID 
            WHERE cabscheds.jobNo = :jobNo AND equiplists.jobNo = :jobNo AND components.jobNo = :jobNo
        ) AS CabHrs 
        GROUP BY Area, progid, cabnum, equipref

        UNION 

        SELECT 
            TendID AS Area, 
            progid AS Section, 
            'Schedule Cable Test' AS Name, 
            SUM(Hrs) AS TotalHours, 
            SUM(RecoveredHours) AS RecoveredHours, 
            cabnum, 
            equipref
        FROM (
            SELECT DISTINCT 
                equiplists.TendID, 
                equiplists.progid, 
                compTest.labnorm AS Hrs, 
                compTest.labnorm * cabscheds.CabTest AS RecoveredHours, 
                cabnum, 
                equipref
            FROM cabscheds 
            INNER JOIN equiplists ON cabscheds.EquipRef = equiplists.Ref 
            INNER JOIN components baseComp ON baseComp.ID = cabscheds.Component_ID 
            LEFT JOIN components compTest ON compTest.jobNo = equiplists.jobNo AND compTest.Name = CONCAT(baseComp.Name, ' Test')
            WHERE cabscheds.jobNo = :jobNo AND equiplists.jobNo = :jobNo AND compTest.jobNo = :jobNo
        ) AS TestHrs 
        GROUP BY Area, progid, cabnum, equipref
    ) AS test 
    GROUP BY Area, progid, Name 
    ORDER BY Area, progid, Name;
    `

    const viewByAreaSectionCompData = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { jobNo },
    })

    return viewByAreaSectionCompData
}

const getViewByLabourAndMaterialData = async (jobNo) => {
    const query = `
    SELECT *
    FROM (
        SELECT Ref, 'N/A' AS CabNum, Component, 1 AS Quantity, MatNorm, MatNorm AS TotalMat, ROUND(LabNorm, 3) AS LabNorm, ROUND(labnorm, 3) AS TotalHours
        FROM equiplists 
        INNER JOIN components ON equiplists.Component_ID = components.ID AND components.jobNo = :jobNo
        WHERE equiplists.jobNo = :jobNo AND components.jobNo = :jobNo

        UNION

        SELECT EquipRef, CabNum, Cabsize AS component, Length, MatNorm, Length * MatNorm AS 'Total Mat', ROUND(LabNorm, 3) AS LabNorm, ROUND((Length * labnorm), 3) AS 'Total Hrs'
        FROM cabscheds
        INNER JOIN components ON CabSize = Name 
        WHERE cabscheds.jobNo = :jobNo AND components.jobNo = :jobNo

        UNION

        SELECT EquipRef, CabNum, CONCAT(CabSize, ' Term') AS component, 2 AS 'Qty', MatNorm, 2 * MatNorm AS 'Total Cost', ROUND(LabNorm, 3) AS LabNorm, ROUND((2 * labnorm), 3) AS 'Total Hrs'
        FROM cabscheds
        INNER JOIN components ON CONCAT(CabSize, ' Term') = Name 
        WHERE cabscheds.jobNo = :jobNo AND components.jobNo = :jobNo

        UNION

        SELECT EquipRef, CabNum, CONCAT(CabSize, ' Test') AS component, 1 AS 'Qty', MatNorm, MatNorm AS 'Total Cost', ROUND(LabNorm, 3) AS LabNorm, ROUND(labnorm, 3) AS 'Total Hrs'
        FROM cabscheds
        INNER JOIN components ON CONCAT(CabSize, ' Test') = Name 
        WHERE cabscheds.jobNo = :jobNo AND components.jobNo = :jobNo
    ) AS labmat
    ORDER BY Ref, CabNum, Component;
    `

    const viewByLabourAndMaterialData = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { jobNo },
    })

    return viewByLabourAndMaterialData
}

const getViewBySectionData = async (jobNo) => {
    const query = `
    SELECT progid AS Section, ROUND(SUM(labnorm), 2) AS TotalHours, ROUND(SUM(RecdHrs), 2) AS RecoveredHours, ROUND(SUM(RecdHrs)/SUM(labnorm) * 100) AS PercentComplete
    FROM
    (
        SELECT progid, equiplists.Component, SUM(components.labnorm) AS "labnorm", SUM((components.labnorm * complete)) AS "RecdHrs"
        FROM equiplists
        INNER JOIN components ON equiplists.Component_ID = components.ID AND components.jobNo = :jobNo
        WHERE equiplists.jobNo = :jobNo
        GROUP BY progid

        UNION

        SELECT progid, cabnum AS Component, (length * components.labnorm) AS "labnorm", ((length * components.labnorm) * cabcomp) AS "RecdHrs"
        FROM equiplists
        JOIN cabscheds ON equiplists.ref = cabscheds.equipref AND cabscheds.jobNo = :jobNo
        JOIN components ON components.Name = cabscheds.cabsize AND components.jobNo = :jobNo
        WHERE equiplists.jobNo = :jobNo
        GROUP BY cabnum

        UNION

        SELECT progid, CONCAT(cabnum, " A Gland") AS Component, components.labnorm AS "labnorm", (components.labnorm * aglandcomp) AS "RecdHrs"
        FROM equiplists
        JOIN cabscheds ON equiplists.ref = cabscheds.equipref AND cabscheds.jobNo = :jobNo
        JOIN components ON components.Name = CONCAT(cabscheds.cabsize, " Term") AND components.jobNo = :jobNo
        WHERE equiplists.jobNo = :jobNo
        GROUP BY cabnum

        UNION

        SELECT progid, CONCAT(cabnum, " Z Gland") AS Component, components.labnorm AS "labnorm", (components.labnorm * zglandcomp) AS "RecdHrs"
        FROM equiplists
        JOIN cabscheds ON equiplists.ref = cabscheds.equipref AND cabscheds.jobNo = :jobNo
        JOIN components ON components.Name = CONCAT(cabscheds.cabsize, " Term") AND components.jobNo = :jobNo
        WHERE equiplists.jobNo = :jobNo
        GROUP BY cabnum

        UNION

        SELECT progid, cabnum AS Component, components.labnorm AS "labnorm", (components.labnorm * cabtest) AS "RecdHrs"
        FROM equiplists
        JOIN cabscheds ON equiplists.ref = cabscheds.equipref AND cabscheds.jobNo = :jobNo
        JOIN components ON components.Name = CONCAT(cabscheds.cabsize, " Test") AND components.jobNo = :jobNo
        WHERE equiplists.jobNo = :jobNo
        GROUP BY cabnum
    ) AS CombinedData

    GROUP BY progid 
    ORDER BY progid;
    `

    const viewBySectionData = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { jobNo },
    })

    return viewBySectionData
}

module.exports = {
    getViewByAreaData,
    getViewByAreaCompData,
    getViewByAreaSectionCompData,
    getViewByLabourAndMaterialData,
    getViewBySectionData,
}
