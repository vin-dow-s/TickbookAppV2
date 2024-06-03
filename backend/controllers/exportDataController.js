const excel = require('excel4node')
const { Equiplist, Cabsched } = require('../models')
const { getMainTableData } = require('./projectController')
const {
    getViewByAreaData,
    getViewByAreaCompData,
    getViewByAreaSectionCompData,
    getViewByLabourAndMaterialData,
    getViewBySectionData,
} = require('./viewController')

const exportFullDetail = async (req, res, next) => {
    const { jobNo } = req.params

    try {
        const equipSheet = await Equiplist.findAll({
            where: {
                jobNo: jobNo,
            },
            order: [
                ['Ref', 'ASC'],
                ['Component', 'ASC'],
            ],
        })
        const cabsched = await Cabsched.findAll({
            where: {
                jobNo: jobNo,
            },
        })

        //Convert Sequelize objects to JSON objects
        const equipSheetData = equipSheet.map((item) =>
            item.get({ plain: true })
        )
        const cabschedData = cabsched.map((item) => item.get({ plain: true }))

        const wb = new excel.Workbook()

        //Equip Sheet
        const ws1 = wb.addWorksheet('Equip Sheet')
        if (equipSheet.length > 0) {
            addToWorksheet(ws1, equipSheetData)
            formatWorksheet(ws1, equipSheetData[0], equipSheetData)
        } else {
            ws1.cell(1, 1).string(
                'No data available in table equiplists for this project.'
            )
        }

        //Cab Sched Sheet
        const ws2 = wb.addWorksheet('Cab Sched')
        if (cabschedData.length > 0) {
            addToWorksheet(ws2, cabschedData)
            formatWorksheet(ws2, cabschedData[0], cabschedData)
        } else {
            ws2.cell(1, 1).string(
                'No data available in table cabscheds for this project.'
            )
        }

        wb.writeToBuffer().then(function (buffer) {
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="${jobNo} Full Detail.xlsx"`
            )
            res.send(buffer)
        })
    } catch (error) {
        console.error('Error while exporting:', error)
        res.status(500).send('Error while exporting data.')
    }
}

const exportMainTableData = async (req, res, next) => {
    const { jobNo } = req.params

    try {
        const mainTable = await getMainTableData(jobNo)

        const wb = new excel.Workbook()

        //Equip List
        const ws1 = wb.addWorksheet('Equip List')
        addToWorksheet(ws1, mainTable)
        formatWorksheet(ws1, mainTable[0], mainTable)

        wb.writeToBuffer().then(function (buffer) {
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="${jobNo} Equip List.xlsx"`
            )
            res.send(buffer)
        })
    } catch (error) {
        console.error('Error while exporting:', error)
        res.status(500).send('Error while exporting data.')
    }
}

const exportViewTableData = async (req, res, next) => {
    const { jobNo, viewType } = req.params
    let viewTable

    try {
        switch (viewType) {
            case 'Area':
                viewTable = await getViewByAreaData(jobNo)
                break
            case 'Area-Comp':
                viewTable = await getViewByAreaCompData(jobNo)
                break
            case 'Area-Section-Comp':
                viewTable = await getViewByAreaSectionCompData(jobNo)
                break
            case 'Labour-Material':
                viewTable = await getViewByLabourAndMaterialData(jobNo)
                break
            case 'Section':
                viewTable = await getViewBySectionData(jobNo)
                break
        }

        const wb = new excel.Workbook()

        //View Table
        const ws1 = wb.addWorksheet('View Table')
        addToWorksheet(ws1, viewTable)
        formatWorksheet(ws1, viewTable[0], viewTable)

        wb.writeToBuffer().then(function (buffer) {
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="${jobNo} ${viewType}.xlsx"`
            )
            res.send(buffer)
        })
    } catch (error) {
        console.error('Error while exporting:', error)
        res.status(500).send('Error while exporting data.')
    }
}

function formatWorksheet(ws, exampleRow, data) {
    const keys = Object.keys(exampleRow)

    // Applying width and bold style for header
    keys.forEach((key, index) => {
        const maxLength = Math.max(
            ...data.map((row) => (row[key] ? String(row[key]).length : 0)),
            key.length
        )
        ws.column(index + 1).setWidth(maxLength + 2)

        ws.cell(1, index + 1).style({ font: { bold: true } })
    })

    // Applying center alignment for all cells
    for (let row = 1; row <= data.length + 1; row++) {
        // +1 for the header
        for (let col = 1; col <= keys.length; col++) {
            ws.cell(row, col).style({ alignment: { horizontal: 'center' } })
        }
    }
}

function addToWorksheet(ws, data) {
    if (!data) {
        console.error('Data is undefined or null')
        return
    }
    const keys = Object.keys(data[0])

    //Set headers
    for (let col = 0; col < keys.length; col++) {
        ws.cell(1, col + 1)
            .string(keys[col])
            .style({ font: { bold: true } })
    }

    //Populate data
    for (let row = 0; row < data.length; row++) {
        for (let col = 0; col < keys.length; col++) {
            const cellData = data[row][keys[col]]
            ws.cell(row + 2, col + 1).string(cellData ? String(cellData) : '')
        }
    }
}

module.exports = {
    exportFullDetail,
    exportMainTableData,
    exportViewTableData,
}
