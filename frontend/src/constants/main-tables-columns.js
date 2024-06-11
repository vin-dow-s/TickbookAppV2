/**
 * @file Columns definition for both tables on the main layout
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
