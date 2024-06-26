/**
 * @file DashboardView columns definition
 */
export const columnsMainTable = [
    {
        headerName: 'Equip Ref',
        field: 'Ref',
        filter: true,
        sortable: true,
        flex: 0.1,
    },
    {
        headerName: 'Section',
        field: 'Section',
        filter: true,
        sortable: true,
        flex: 0.15,
    },
    {
        headerName: 'Description',
        field: 'Description',
        filter: true,
        sortable: true,
        flex: 0.28,
    },
    {
        headerName: 'Total Hours',
        field: 'TotalHours',
        filter: true,
        sortable: true,
        flex: 0.1,
    },
    {
        headerName: 'Recovered Hours',
        field: 'RecoveredHours',
        filter: true,
        sortable: true,
        flex: 0.12,
    },
    {
        headerName: '% Complete',
        field: 'PercentComplete',
        filter: true,
        sortable: true,
        valueFormatter: (params) => Math.round(params.value),
        flex: 0.1,
    },
    {
        headerName: 'Area',
        field: 'Area',
        filter: true,
        sortable: true,
        flex: 0.15,
    },
]

export const columnsViewByArea = [
    {
        headerName: 'Area',
        field: 'Area',
        sortable: true,
        filter: true,
        flex: 0.3,
    },
    {
        headerName: 'Tend Hours',
        field: 'TotalHours',
        sortable: true,
        filter: true,
        flex: 0.2,
    },
    {
        headerName: 'Recovered Hours',
        field: 'RecoveredHours',
        sortable: true,
        filter: true,
        flex: 0.25,
    },
    {
        headerName: '% Complete',
        field: 'PercentComplete',
        sortable: true,
        filter: true,
        flex: 0.25,
    },
]

export const columnsViewByAreaComp = [
    {
        headerName: 'Area',
        field: 'Area',
        sortable: true,
        filter: true,
        flex: 0.2,
    },
    {
        headerName: 'Component',
        field: 'Component',
        sortable: true,
        filter: true,
        flex: 0.3,
    },
    {
        headerName: 'Tend Hours',
        field: 'TotalHours',
        sortable: true,
        filter: true,
        flex: 0.15,
    },
    {
        headerName: 'Recovered Hours',
        field: 'RecoveredHours',
        sortable: true,
        filter: true,
        flex: 0.2,
    },
    {
        headerName: '% Complete',
        field: 'PercentComplete',
        sortable: true,
        filter: true,
        flex: 0.15,
    },
]

export const columnsViewByAreaSectionComp = [
    {
        headerName: 'Area',
        field: 'Area',
        sortable: true,
        filter: true,
        flex: 0.17,
    },
    {
        headerName: 'Section',
        field: 'Section',
        sortable: true,
        filter: true,
        flex: 0.18,
    },
    {
        headerName: 'Component',
        field: 'Component',
        sortable: true,
        filter: true,
        flex: 0.3,
    },
    {
        headerName: 'Tend Hours',
        field: 'TotalHours',
        sortable: true,
        filter: true,
        flex: 0.1,
    },
    {
        headerName: 'Recovered Hours',
        field: 'RecoveredHours',
        sortable: true,
        filter: true,
        flex: 0.15,
    },
    {
        headerName: '% Complete',
        field: 'PercentComplete',
        sortable: true,
        filter: true,
        flex: 0.1,
    },
]

export const columnsViewByLabourAndMaterial = [
    {
        headerName: 'Equip Ref',
        field: 'Ref',
        sortable: true,
        filter: true,
        flex: 0.12,
    },
    {
        headerName: 'Cable No',
        field: 'CabNum',
        sortable: true,
        filter: true,
        flex: 0.1,
    },
    {
        headerName: 'Component',
        field: 'Component',
        sortable: true,
        filter: true,
        flex: 0.28,
    },
    {
        headerName: 'Qty',
        field: 'Quantity',
        sortable: true,
        filter: true,
        flex: 0.1,
    },
    {
        headerName: 'Mat Norm',
        field: 'MatNorm',
        sortable: true,
        filter: true,
        flex: 0.1,
    },
    {
        headerName: 'Total Mat',
        field: 'TotalMat',
        sortable: true,
        filter: true,
        flex: 0.1,
    },
    {
        headerName: 'Lab Norm',
        field: 'LabNorm',
        sortable: true,
        filter: true,
        flex: 0.1,
    },
    {
        headerName: 'Total Hrs',
        field: 'TotalHours',
        sortable: true,
        filter: true,
        flex: 0.1,
    },
]

export const columnsViewBySection = [
    {
        headerName: 'Section',
        field: 'Section',
        sortable: true,
        filter: true,
        flex: 0.3,
    },
    {
        headerName: 'Tend Hours',
        field: 'TotalHours',
        sortable: true,
        filter: true,
        flex: 0.2,
    },
    {
        headerName: 'Recovered Hours',
        field: 'RecoveredHours',
        sortable: true,
        filter: true,
        flex: 0.25,
    },
    {
        headerName: '% Complete',
        field: 'PercentComplete',
        sortable: true,
        filter: true,
        flex: 0.25,
    },
]

/**
 * @file DashboardView DialogBoxes columns definitions
 */
export const columnsEquipRef = [
    {
        headerName: 'Component',
        field: 'Component',
        filter: true,
        sortable: true,
        minWidth: 350,
        flex: 1,
        cellStyle: (params) => {
            if (params.data.Code === 'ttl' || params.data.Code === 'blk') {
                return { fontWeight: 'bold' }
            }
            return { fontWeight: 'initial' }
        },
    },
    {
        headerName: 'Lab Norm',
        field: 'LabNorm',
        filter: true,
        sortable: true,
        minWidth: 50,
        valueFormatter: (params) => {
            if (params.data.Code === 'ttl' || params.data.Code === 'blk') {
                return ''
            }
            return params.value
        },
    },
    {
        headerName: 'Current Recovery',
        field: 'CurrentRecovery',
        filter: true,
        sortable: true,
        minWidth: 50,
        valueFormatter: (params) => {
            if (
                params.data.Code === 'ttl' ||
                params.data.Code === 'blk' ||
                params.data.LabNorm === 0
            ) {
                return ''
            }
            const fixedValue = params.value.toFixed(3)
            return parseFloat(fixedValue).toString()
        },
        valueParser: (params) => {
            if (params.data.Code === 'ttl' || params.data.Code === 'blk') {
                return params.oldValue
            }
            return parseFloat(params.newValue)
        },
    },
    {
        headerName: '% Complete',
        field: 'PercentComplete',
        filter: true,
        sortable: true,
        editable: (params) =>
            params.data.Code !== 'ttl' &&
            params.data.Code !== 'blk' &&
            params.data.LabNorm !== 0,
        minWidth: 50,
        cellEditor: 'agNumberCellEditor',
        cellStyle: { color: '#00675C', fontStyle: 'italic' },
        cellEditorParams: {
            min: 0,
            max: 100,
        },
        valueFormatter: (params) => {
            if (
                params.data.Code === 'ttl' ||
                params.data.Code === 'blk' ||
                params.data.LabNorm === 0
            ) {
                return ''
            }
            return Math.round(params.value)
        },
        valueParser: (params) => {
            if (params.data.Code === 'ttl' || params.data.Code === 'blk') {
                return params.oldValue
            }
            return parseFloat(params.newValue)
        },
        valueSetter: (params) => {
            if (params.data.Code === 'ttl' || params.data.Code === 'blk') {
                return false
            }
            const newValue = parseFloat(params.newValue)
            if (isNaN(newValue)) {
                params.data.PercentComplete = params.oldValue
                return true
            }
            if (params.oldValue !== Number(newValue)) {
                params.data.CurrentRecovery =
                    (newValue * params.data.LabNorm) / 100
                params.data.PercentComplete = newValue
                return true
            }
            return false
        },
    },
]

export const columnsEquipInAreaComp = [
    {
        headerName: 'Equip Ref',
        field: 'Ref',
        filter: true,
        sortable: true,
        flex: 0.1,
    },
    {
        headerName: 'Component',
        field: 'Component',
        filter: true,
        sortable: true,
        flex: 0.2,
    },
    {
        headerName: 'Total Hours',
        field: 'TotalHours',
        filter: true,
        sortable: true,
        flex: 0.1,
    },
    {
        headerName: 'Recovered Hours',
        field: 'RecoveredHours',
        filter: true,
        sortable: true,

        flex: 0.1,
    },
    {
        headerName: '% Complete',
        field: 'PercentComplete',
        filter: true,
        sortable: true,
        valueFormatter: (params) => Math.round(params.value),
        flex: 0.1,
    },
]

export const columnsEquipInAreaCompCables = [
    {
        headerName: 'Equip Ref',
        field: 'Ref',
        filter: true,
        sortable: true,
        flex: 0.1,
    },
    {
        headerName: 'Component',
        field: 'CabNum',
        filter: true,
        sortable: true,
        flex: 0.2,
    },
    {
        headerName: 'Total Hours',
        field: 'TotalHours',
        filter: true,
        sortable: true,
        flex: 0.1,
    },
    {
        headerName: 'Recovered Hours',
        field: 'RecoveredHours',
        filter: true,
        sortable: true,

        flex: 0.1,
    },
    {
        headerName: '% Complete',
        field: 'PercentComplete',
        filter: true,
        sortable: true,
        valueFormatter: (params) => Math.round(params.value),
        flex: 0.1,
    },
]

export const columnsEquipInAreaSectionComp = [
    {
        headerName: 'Equip Ref',
        field: 'Ref',
        filter: true,
        sortable: true,
        flex: 0.1,
    },
    {
        headerName: 'Component',
        field: 'Component',
        filter: true,
        sortable: true,
        flex: 0.2,
    },
    {
        headerName: 'Total Hours',
        field: 'TotalHours',
        filter: true,
        sortable: true,
        flex: 0.1,
    },
    {
        headerName: 'Recovered Hours',
        field: 'RecoveredHours',
        filter: true,
        sortable: true,
        flex: 0.1,
    },
    {
        headerName: '% Complete',
        field: 'PercentComplete',
        filter: true,
        sortable: true,
        valueFormatter: (params) => Math.round(params.value),
        flex: 0.1,
    },
]

export const columnsEquipInAreaSectionCompCables = [
    {
        headerName: 'Equip Ref',
        field: 'Ref',
        filter: true,
        sortable: true,
        flex: 0.1,
    },
    {
        headerName: 'Component',
        field: 'CabNum',
        filter: true,
        sortable: true,
        flex: 0.2,
    },
    {
        headerName: 'Total Hours',
        field: 'TotalHours',
        filter: true,
        sortable: true,
        flex: 0.1,
    },
    {
        headerName: 'Recovered Hours',
        field: 'RecoveredHours',
        filter: true,
        sortable: true,
        flex: 0.1,
    },
    {
        headerName: '% Complete',
        field: 'PercentComplete',
        filter: true,
        sortable: true,
        valueFormatter: (params) => Math.round(params.value),
        flex: 0.1,
    },
]

export const columnsEquipInSection = [
    {
        headerName: 'Equip Ref',
        field: 'Ref',
        filter: true,
        sortable: true,
        flex: 0.15,
    },
    {
        headerName: 'Description',
        field: 'Description',
        filter: true,
        sortable: true,
        flex: 0.35,
    },
    {
        headerName: 'Total Hours',
        field: 'TotalHours',
        filter: true,
        sortable: true,
        flex: 0.15,
    },
    {
        headerName: 'Recovered Hours',
        field: 'RecoveredHours',
        filter: true,
        sortable: true,
        flex: 0.2,
    },
    {
        headerName: '% Complete',
        field: 'PercentComplete',
        filter: true,
        sortable: true,
        valueFormatter: (params) => Math.round(params.value),
        flex: 0.15,
    },
]

/**
 * @file ComponentsView columns definition
 */
export const columnsComponents = [
    {
        headerName: 'Code',
        field: 'Code',
        filter: true,
        sortable: true,
        flex: 0.1,
    },
    {
        headerName: 'Name',
        field: 'Name',
        filter: true,
        sortable: true,
        flex: 0.3,
    },
    {
        headerName: 'Lab Norm',
        field: 'LabNorm',
        filter: true,
        sortable: true,
        valueFormatter: (params) => {
            const fixedValue = params.value.toFixed(3)
            return parseFloat(fixedValue).toString()
        },
        flex: 0.1,
    },
    {
        headerName: 'Lab Uplift',
        field: 'LabUplift',
        filter: true,
        sortable: true,
        flex: 0.1,
    },
    {
        headerName: 'Mat Norm',
        field: 'MatNorm',
        filter: true,
        sortable: true,
        flex: 0.1,
    },
    {
        headerName: 'S/C Cost',
        field: 'SubConCost',
        filter: true,
        sortable: true,
        flex: 0.1,
    },
    {
        headerName: 'S/C Norm',
        field: 'SubConNorm',
        filter: true,
        sortable: true,
        flex: 0.1,
    },
    {
        headerName: 'Plant Cost',
        field: 'PlantCost',
        filter: true,
        sortable: true,
        flex: 0.1,
    },
]

/**
 * @file TemplatesView columns definition
 */
export const columnsComponentsInProject = [
    {
        headerName: 'Name',
        field: 'Name',
        filter: true,
        sortable: true,
        flex: 0.75,
    },
    {
        headerName: 'Lab Norm',
        field: 'LabNorm',
        filter: true,
        sortable: true,
        valueFormatter: (params) => {
            const fixedValue = params.value.toFixed(3)
            return parseFloat(fixedValue).toString()
        },
        flex: 0.25,
    },
]

export const columnsTemplates = [
    {
        headerName: 'Template',
        field: 'Name',
        filter: true,
        sortable: true,
        flex: 0.7,
    },
    {
        headerName: 'Hours',
        field: 'Hours',
        filter: true,
        sortable: true,
        flex: 0.3,
    },
]

/**
 * @file TemplatesView + EquipmentView columns definition
 */
export const columnsComponentsInSelectedTemplate = [
    {
        headerName: 'Name',
        field: 'Component',
        filter: false,
        sortable: false,
        flex: 0.75,
    },
    {
        headerName: 'Lab Norm',
        field: 'LabNorm',
        filter: false,
        sortable: false,
        valueFormatter: (params) => {
            const fixedValue = params.value.toFixed(3)
            return parseFloat(fixedValue).toString()
        },
        flex: 0.25,
    },
]

/**
 * @file CabschedsView columns definition
 */
const completionCellStyle = (params) => {
    if (
        params.colDef.field === 'CabTest' &&
        params.data.CabComp === 100 &&
        params.value !== 100
    ) {
        return {
            backgroundColor: '#FFC487',
            color: '#413C8C',
            fontStyle: 'italic',
        }
    } else if (params.value === 100) {
        return {
            backgroundColor: '#d6ffd6',
            color: '#413C8C',
            fontStyle: 'italic',
        }
    } else {
        return { color: '#413C8C', fontStyle: 'italic' }
    }
}

export const columnsCabscheds = [
    {
        headerName: 'Cable No',
        field: 'CabNum',
        filter: true,
        sortable: true,
        flex: 0.13,
    },
    {
        headerName: 'Cable Size',
        field: 'CabSize',
        filter: true,
        sortable: true,
        minWidth: 200,
        flex: 0.17,
    },
    {
        headerName: 'Length',
        field: 'Length',
        filter: true,
        sortable: true,
        flex: 0.1,
    },
    {
        headerName: 'Equip Ref',
        field: 'EquipRef',
        filter: true,
        sortable: true,
        flex: 0.1,
    },
    {
        headerName: 'A Gland Area',
        field: 'AGlandArea',
        filter: true,
        sortable: true,
        flex: 0.1,
    },
    {
        headerName: 'Z Gland Area',
        field: 'ZGlandArea',
        filter: true,
        sortable: true,
        flex: 0.1,
    },
    {
        headerName: 'Cable % Comp',
        field: 'CabComp',
        filter: true,
        sortable: true,
        editable: (params) => !params.data.tickCabBySC,
        flex: 0.1,
        cellEditor: 'agNumberCellEditor',
        cellStyle: completionCellStyle,
        cellEditorParams: {
            min: 0,
            max: 100,
        },
        valueFormatter: (params) => Math.round(params.value),
        valueParser: (params) => parseFloat(params.newValue),
    },
    {
        headerName: 'A Gland % Comp',
        field: 'AGlandComp',
        filter: true,
        sortable: true,
        editable: true,
        flex: 0.1,
        cellEditor: 'agNumberCellEditor',
        cellStyle: completionCellStyle,
        cellEditorParams: {
            min: 0,
            max: 100,
        },
        valueFormatter: (params) => Math.round(params.value),
        valueParser: (params) => parseFloat(params.newValue),
    },
    {
        headerName: 'Z Gland % Comp',
        field: 'ZGlandComp',
        filter: true,
        sortable: true,
        editable: true,
        flex: 0.1,
        cellEditor: 'agNumberCellEditor',
        cellStyle: completionCellStyle,
        cellEditorParams: {
            min: 0,
            max: 100,
        },
        valueFormatter: (params) => Math.round(params.value),
        valueParser: (params) => parseFloat(params.newValue),
    },
    {
        headerName: 'Test % Comp',
        field: 'CabTest',
        filter: true,
        sortable: true,
        editable: true,
        flex: 0.1,
        cellEditor: 'agNumberCellEditor',
        cellStyle: completionCellStyle,
        cellEditorParams: {
            min: 0,
            max: 100,
        },
        valueFormatter: (params) => Math.round(params.value),
        valueParser: (params) => parseFloat(params.newValue),
    },
    {
        headerName: 'Installed',
        field: 'tickCabBySC',
        filter: false,
        sortable: true,
        editable: false,
        flex: 0.1,
        cellRenderer: function (params) {
            return params.value ? '✔' : ''
        },
        valueFormatter: function (params) {
            if (params.value && typeof params.value === 'object') {
                return params.value.isInstalled ? 'Installed' : 'Not Installed'
            }
            return params.value ? 'Installed' : 'Not Installed'
        },
    },
]

/**
 * @file MultiUpdateView columns definition
 */
export const columnsMultiUpdateEquipment = [
    {
        headerName: 'Equipment Ref',
        field: 'Ref',
        filter: true,
        sortable: true,
        checkboxSelection: true,
        headerCheckboxSelection: true,
        flex: 0.3,
    },
    {
        headerName: 'Description',
        field: 'Description',
        filter: true,
        sortable: true,
        flex: 0.7,
    },
]

export const columnsMultiUpdateCodes = [
    {
        headerName: 'Code',
        field: 'Code',
        filter: true,
        sortable: true,
        flex: 0.2,
    },
    {
        headerName: 'Name',
        field: 'Name',
        filter: true,
        sortable: true,
        flex: 0.5,
    },
    {
        headerName: '% Complete',
        field: 'PercentComplete',
        filter: false,
        sortable: false,
        editable: true,
        flex: 0.3,
    },
]

/**
 * @file RevisionsView columns definition
 */
export const columnsRevisions = [
    {
        headerName: 'Revision',
        field: 'Revision',
        filter: true,
        sortable: true,
        flex: 0.15,
    },
    {
        headerName: 'Item Ref',
        field: 'Item_Ref',
        filter: true,
        sortable: true,
        flex: 0.15,
    },
    {
        headerName: 'Item Description',
        field: 'Item_Desc',
        filter: true,
        sortable: true,
        flex: 0.3,
    },
    {
        headerName: 'Notes',
        field: 'Notes',
        filter: true,
        sortable: true,
        flex: 0.15,
    },
    {
        headerName: 'Dated',
        field: 'Dated',
        filter: true,
        sortable: true,
        flex: 0.25,
    },
]

/**
 * @file CCsView columns definition
 */
export const columnsCCsHistory = [
    {
        headerName: 'Equip Ref',
        field: 'EquipRef',
        filter: true,
        sortable: true,
        flex: 0.15,
    },
    {
        headerName: 'CC Ref',
        field: 'CcRef',
        filter: true,
        sortable: true,
        flex: 0.15,
    },
    {
        headerName: 'Description',
        field: 'Description',
        filter: true,
        sortable: true,
        flex: 0.35,
    },
    {
        headerName: 'Date Imp',
        field: 'DateImp',
        filter: true,
        sortable: true,
        flex: 0.1,
        valueFormatter: (params) => {
            if (!params.value) return null
            const date = new Date(params.value)
            return date.toLocaleDateString('en-GB')
        },
    },
    {
        headerName: 'Date Lift',
        field: 'DateLift',
        filter: true,
        sortable: true,
        editable: true,
        flex: 0.15,
        cellEditor: 'agDateCellEditor',
        cellStyle: { color: '#413C8C', fontStyle: 'italic' },
        cellRenderer: (params) => {
            if (!params.value) return 'Click to pick a date'
            const date = new Date(params.value)
            return date.toLocaleDateString('en-GB')
        },
        valueParser: (params) => {
            const parts = params.newValue.split('/')
            const date = new Date(Date.UTC(parts[2], parts[1] - 1, parts[0]))
            return date.toISOString()
        },
    },
    {
        headerName: 'Status',
        field: 'Status',
        filter: true,
        sortable: true,
        flex: 0.1,
    },
]

/**
 * @file TenderSectionsView columns definition
 */
export const columnsTenderSections = [
    {
        headerName: 'TendSection',
        field: 'TendSection',
        filter: true,
        sortable: true,
        flex: 0.15,
    },
    {
        headerName: 'Ref',
        field: 'EquipRef',
        filter: true,
        sortable: true,
        flex: 0.25,
    },
    {
        headerName: 'Description',
        field: 'Description',
        filter: true,
        sortable: true,
        flex: 0.45,
    },
    {
        headerName: 'Total Hours',
        field: 'TotalHours',
        filter: true,
        sortable: true,
        flex: 0.15,
    },
]

/**
 * @file ProjectView columns definition
 */
export const columnsSelectProject = [
    {
        headerName: 'Number',
        field: 'JobNo',
        filter: true,
        sortable: true,
        flex: 0.2,
    },
    {
        headerName: 'Title',
        field: 'Title',
        filter: true,
        sortable: true,
        flex: 0.4,
    },
    {
        headerName: 'Address',
        field: 'Address',
        filter: true,
        sortable: true,
        flex: 0.4,
    },
]

/**
 * @file CodesView columns definition
 */
export const columnsCodes = [
    {
        headerName: 'Code',
        field: 'Code',
        filter: true,
        sortable: true,
        flex: 0.3,
    },
    {
        headerName: 'Name',
        field: 'Name',
        filter: true,
        sortable: true,
        flex: 0.7,
    },
]
