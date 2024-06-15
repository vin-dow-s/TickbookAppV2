/**
 * @file Right-click menu options of the different Tables across the App.
 */
export const contextMenuOptions = {
    mainTable: [
        {
            label: 'Edit Equipment',
            icon: '/edit-line.svg',
            action: 'editEquipment',
        },

        {
            label: 'Delete Equipment',
            icon: '/delete-bin-line.svg',
            action: 'deleteEquipment',
        },
        {
            label: 'Add CC',
            icon: '/add-line.svg',
            action: 'addCC',
        },
    ],
    componentsTable: [
        {
            label: 'Edit Component',
            icon: '/edit-line.svg',
            action: 'editComponent',
        },
        {
            label: 'Delete Component',
            icon: '/delete-bin-line.svg',
            action: 'deleteComponent',
        },
        {
            label: 'Update Multiple Codes',
            icon: '/checkbox-multiple-line.svg',
            action: 'updateMultipleCodes',
        },
    ],
    templatesTable: [
        {
            label: 'Edit Template',
            icon: '/edit-line.svg',
            action: 'editTemplate',
        },
        {
            label: 'Duplicate Template',
            icon: '/file-copy-line.svg',
            action: 'duplicateTemplate',
        },
    ],
    cabschedsTable: [
        { label: 'Edit Cable', icon: '/edit-line.svg', action: 'editCabsched' },
        {
            label: 'Installed by SubCon',
            icon: '/mark-pen-fill.svg',
            action: 'markInstalled',
        },
        {
            label: 'Delete Cable',
            icon: '/delete-bin-line.svg',
            action: 'deleteCabsched',
        },
    ],
    export: [{ label: 'Export', icon: '/share-box-line.svg' }],
}
