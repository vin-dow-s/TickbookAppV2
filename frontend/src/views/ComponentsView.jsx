//Modules
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'

//Utils
import { readExcelFile } from '../utils/readExcelFile'
import {
    deleteComponentURL,
    generateProjectComponentsBulkURL,
    generateProjectComponentsURL,
    isComponentUsedInTemplateURL,
    updateComponentURL,
} from '../utils/apiConfig'
import {
    componentsNamePattern,
    onlyFloatsPattern,
} from '../utils/regexPatterns'
import {
    getClassForField,
    validateFormFields,
} from '../utils/validationFormFields'

//Styles and constants
import { Overlay } from '../styles/dialog-boxes'
import { colors } from '../styles/global-styles'
import { StyledAGGrid } from '../styles/tables'
import { columnsComponents } from '../constants/dialog-box-tables-columns'
import { contextMenuOptions } from '../constants/context-menu'

//Components
import FileUploadButton from '../components/Common/FileUploadButton'
import {
    ButtonsContainer,
    ErrorMessage,
    FieldsContainer,
    FormBase,
    FormField,
    LabelInputContainer,
} from '../components/Common/FormBase'
import FormButton from '../components/Common/FormButton'
import MainLoader from '../components/Common/MainLoader'
import { overlayLoadingTemplatePurple } from '../components/Common/Loader'
import ContextMenu from '../components/Common/ContextMenu'
import useStore from '../hooks/useStore'

//Styled components declarations
const MainLoaderOverlayContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 50000;
    background: rgba(0, 0, 0, 0.5);
`

const ComponentsViewContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 10px;
    background-color: #f7f6f3;

    .purple-label {
        color: ${colors.purpleBgen};
        font-size: small;
        font-style: italic;
    }
`

const LabelAndInputContainer = styled.div`
    display: flex;
    justify-content: space-between;
    background-color: white;
    margin-bottom: 2px;
`

const CreateComponentAndFileUploadContainer = styled.div`
    display: flex;
    flex: 1;
    gap: 10px;
    background-color: #f7f6f3;
    color: black;
    border-radius: 10px;
`

const CreateComponentContainer = styled.div`
    flex: 0.8;
    background-color: white;
    color: black;
    border-radius: 10px;
    padding: 10px;
`

const CreationStepMessageContainer = styled.div`
    position: absolute;
    top: 58%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 1.2em;
    z-index: 50001;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
`

const ComponentsDataContainer = styled.div`
    flex: 1.5;
    background-color: white;
    color: black;
    border-radius: 10px;
    padding: 10px;
`

const CreateComponentForm = styled(FormBase)`
    position: relative;

    input,
    select {
        margin-left: 10px;
    }

    .CreateComponentForm-label {
        position: absolute;
        top: -8px;
        left: 10px;
        padding: 0 5px;
        background-color: white;
        color: ${colors.purpleBgen};
        font-style: italic;

        &.cable {
            left: 8px;
            color: grey;
        }
    }

    .CreateComponentForm-label--bottom {
        position: absolute;
        bottom: -6px;
        left: 22px;
        padding: 0 5px;
        background-color: white;
        color: ${colors.purpleBgen};
        font-style: italic;

        &.cable {
            color: grey;
        }
    }

    @media screen and (max-width: 1500px), screen and (max-height: 700px) {
        font-size: smaller;
    }
`

const FieldsWrapper = styled.div`
    display: flex;
    flex-direction: row;
`

const CreateComponentFormFieldsContainer = styled(FieldsContainer)`
    flex-direction: column;
    flex: 1;
    gap: 10px;

    .disabled {
        color: ${colors.tablesBorders};
    }
`

const CreateComponentExtraFieldsContainer = styled(FieldsContainer)`
    position: relative;
    flex-direction: column;
    align-items: center;
    padding: 10px;
    margin-left: 25px;
    gap: 0;
    border-radius: 10px;
    border: 1px solid ${colors.tablesBorders};
    font-size: smaller;

    .cableFields {
        flex-direction: column;
        margin-top: 0;
        font-size: smaller;

        input {
            font-size: small;
            margin-left: 0;
        }

        > label {
            width: max-content;
            margin-right: 0;
            padding-bottom: 3px;
        }
    }
`

const FirstRowContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-around;
`

const SecondRowContainer = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 25px;
`

const CreateComponentFormField = styled(FormField)`
    position: relative;
    flex-direction: column;
    align-items: flex-start;

    label {
        display: flex;
        flex-direction: row;
    }

    input {
        width: 30px;
    }

    &.nameField {
        flex: 1;

        input {
            width: 100%;
        }
    }

    .disabled-field {
        color: ${colors.tablesBorders};
    }

    .codeName {
        position: absolute;
        width: 300px;
        top: 45px;
        font-size: smaller;
        color: ${colors.purpleBgenDarker};
    }

    @media screen and (max-width: 1120px), screen and (max-height: 700px) {
        input {
            width: 15px;
        }
    }
`

const FileUploadContainer = styled.div`
    flex: 0.2;
    padding: 10px;
    background-color: white;
    color: black;
    border-radius: 10px;

    .file-label {
        position: absolute;
        top: -8px;
        left: 10px;
        padding: 0 5px;
        background-color: ${colors.mainFrameBackground};
        color: ${colors.purpleBgen};
        font-style: italic;
    }

    .file-content {
        width: 100%;
        height: calc(100% - 24px);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .file-loaded-indicator {
        margin-top: 10px;
        text-align: center;
        font-style: italic;
        font-size: smaller;
        color: rgba(0, 0, 0, 0.5);
    }

    @media screen and (max-width: 1120px), screen and (max-height: 700px) {
        font-size: smaller;
    }
`

const ComponentsView = () => {
    // 1. State declarations
    const {
        jobNo,
        componentsList,
        codesList,
        isLoading,
        fetchComponentsList,
        fetchCodesList,
        onComponentCreate,
        onComponentsBulkCreate,
        onComponentUpdate,
        onComponentDelete,
    } = useStore((state) => ({
        jobNo: state.jobNo,
        componentsList: state.componentsList,
        codesList: state.codesList,
        isLoading: state.isLoading,
        fetchComponentsList: state.fetchComponentsList,
        fetchCodesList: state.fetchCodesList,
        onComponentCreate: state.onComponentCreate,
        onComponentsBulkCreate: state.onComponentsBulkCreate,
        onComponentUpdate: state.onComponentUpdate,
        onComponentDelete: state.onComponentDelete,
    }))
    const [componentsTableGridApi, setComponentsTableGridApi] = useState(null)
    const [contextMenuState, setContextMenuState] = useState({
        visible: false,
        position: { x: 0, y: 0 },
        rowData: null,
    })
    const [quickFilterText, setQuickFilterText] = useState('')
    const [selectedComponent, setSelectedComponent] = useState(null)
    const [isUsedInTemplate, setIsUsedInTemplate] = useState(false)
    const [isCreatingItems, setIsCreatingItems] = useState(false)
    const [creationStepMessage, setCreationStepMessage] = useState('')
    const [currentComponentData, setCurrentComponentData] = useState(null)
    const [isEditable, setIsEditable] = useState(true)
    const [isDeleteComponentDialogBoxOpen, setIsDeleteComponentDialogBoxOpen] =
        useState(false)
    const [restoreTableFocus, setRestoreTableFocus] = useState(null)

    const fieldNames = [
        'Code',
        'Name',
        'LabNorm',
        'LabUplift',
        'MatNorm',
        'SubConCost',
        'SubConNorm',
        'PlantCost',
        'GlandNorm',
        'TestNorm',
    ]
    const DEFAULT_VALUES = {
        Code: 'acc',
        Name: '',
        LabNorm: 0,
        LabUplift: 0,
        MatNorm: 0,
        SubConCost: 0,
        SubConNorm: 0,
        PlantCost: 0,
        GlandNorm: '',
        TestNorm: '',
    }
    const [, setIsValid] = useState({
        Name: null,
        LabNorm: null,
        LabUplift: null,
        MatNorm: null,
        SubConCost: null,
        SubConNorm: null,
        PlantCost: null,
        GlandNorm: null,
        TestNorm: null,
    })
    const [fieldErrors, setFieldErrors] = useState({
        Code: '',
        Name: '',
        LabNorm: '',
        LabUplift: '',
        MatNorm: '',
        SubConCost: '',
        SubConNorm: '',
        PlantCost: '',
        GlandNorm: '',
        TestNorm: '',
    })
    const [fieldValues, setFieldValues] = useState(DEFAULT_VALUES)

    //2. Helper Functions
    const validators = {
        Name: (value) =>
            componentsNamePattern.test(value)
                ? ''
                : 'Name must be 3-180 characters long and contain no invalid character.',
        LabNorm: (value) =>
            onlyFloatsPattern.test(value) ? '' : 'Lab Norm must be a number.',
        LabUplift: (value) =>
            onlyFloatsPattern.test(value) ? '' : 'Lab Uplift must be a number.',
        MatNorm: (value) =>
            onlyFloatsPattern.test(value) ? '' : 'Mat Norm must be a number.',
        SubConCost: (value) =>
            onlyFloatsPattern.test(value) ? '' : 'S/C Cost must be a number.',
        SubConNorm: (value) =>
            onlyFloatsPattern.test(value) ? '' : 'S/C Norm must be a number.',
        PlantCost: (value) =>
            onlyFloatsPattern.test(value) ? '' : 'Plant Cost must be a number.',
        GlandNorm: (value) =>
            onlyFloatsPattern.test(value) ? '' : 'must be a number.',
        TestNorm: (value) =>
            onlyFloatsPattern.test(value) ? '' : 'must be a number.',
    }

    const fieldClasses = {
        Code: getClassForField('Code', fieldErrors, fieldValues),
        Name: getClassForField('Name', fieldErrors, fieldValues),
        LabNorm: getClassForField('LabNorm', fieldErrors, fieldValues),
        LabUplift: getClassForField('LabUplift', fieldErrors, fieldValues),
        MatNorm: getClassForField('MatNorm', fieldErrors, fieldValues),
        SubConCost: getClassForField('SubConCost', fieldErrors, fieldValues),
        SubConNorm: getClassForField('SubConNorm', fieldErrors, fieldValues),
        PlantCost: getClassForField('PlantCost', fieldErrors, fieldValues),
        GlandNorm: getClassForField('GlandNorm', fieldErrors, fieldValues),
        TestNorm: getClassForField('TestNorm', fieldErrors, fieldValues),
    }

    const onCellContextMenu = (params) => {
        const event = params.event
        event.preventDefault()
        setContextMenuState({
            visible: true,
            position: { x: event.clientX, y: event.clientY },
            rowData: params.node.data,
        })
    }

    const componentsTableGridOptions = {
        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true,
        },
        columnDefs: columnsComponents,
        rowSelection: 'single',
        onCellContextMenu: onCellContextMenu,
        overlayLoadingTemplate: overlayLoadingTemplatePurple,
        onGridReady: (params) => {
            setComponentsTableGridApi(params.api)
            params.api.updateGridOptions({ rowData: componentsList })
        },
    }

    const isComponentNameUnique = (name, componentsList) => {
        return !componentsList.some((component) => component.Name === name)
    }

    const isNameUsedByCbsComponent = (name, componentsList) => {
        return componentsList.some(
            (component) => component.Name === name && component.Code === 'cbs'
        )
    }

    const findAssociatedCableComponents = (componentName, componentsList) => {
        const termName = componentName + ' Term'
        const testName = componentName + ' Test'

        const associatedComponents = componentsList.filter(
            (component) =>
                component.Name === termName || component.Name === testName
        )

        return associatedComponents
    }

    // 3. Event handlers
    const handleInputChange = (e) => {
        const { id, value } = e.target
        const trimmedValue = value.trim()

        // Dynamically check the input against the regex pattern and set error message
        const errorMessage = validators[id] ? validators[id](trimmedValue) : ''
        setFieldErrors((prevErrors) => ({ ...prevErrors, [id]: errorMessage }))

        // Update field values
        setFieldValues((prevValues) => ({ ...prevValues, [id]: value }))
    }

    const handleFileUpload = async (event) => {
        setIsCreatingItems(true)
        setCreationStepMessage('Reading Excel file...')

        try {
            const file = event.target.files[0]
            const jsonData = await readExcelFile(file)
            let finalComponentsData = []
            let errorLines = []
            const nonExistingCodes = new Set()

            for (const componentData of jsonData) {
                const codeExists = codesList.some(
                    (item) => item.Code === componentData.Code
                )

                if (!codeExists) {
                    nonExistingCodes.add(componentData.Code)
                    errorLines.push(componentData.__rowNum__ + 1)
                    continue
                }

                finalComponentsData.push({
                    ...componentData,
                    lineNumber: componentData.__rowNum__ + 1,
                })
            }

            setCreationStepMessage('Creating Components...')
            const bulkCreateResult = await handleCreateComponentsOnFileUpload(
                finalComponentsData
            )

            toast.info(`Processed ${jsonData.length} lines.`)

            if (nonExistingCodes.size > 0) {
                toast.error(
                    `These Codes do not exist: ${Array.from(
                        nonExistingCodes
                    ).join(', ')}`
                )
            }

            if (bulkCreateResult.success) {
                const { success, alreadyExists, failures } =
                    bulkCreateResult.results

                if (
                    alreadyExists.length > 0 &&
                    jsonData.length !== alreadyExists.length
                ) {
                    toast.warning(
                        `${alreadyExists.length} Component(s) already exist.`
                    )
                }

                if (success.length > 0) {
                    toast.success(
                        `${success.length} Component(s) successfully created.`
                    )
                    onComponentsBulkCreate(success)
                }

                if (failures.length > 0) {
                    const failureLineNumbers = failures
                        .map((f) => f.lineNumber)
                        .join(', ')
                    toast.error(
                        `${failures.length} error(s). Please check your file on lines: ${failureLineNumbers}.`
                    )
                }

                if (alreadyExists.length === jsonData.length)
                    toast.info('No new Components to create.')
            } else {
                toast.error(`Error during creation: ${bulkCreateResult.error}`)
                console.error(bulkCreateResult.error)
            }
        } catch (error) {
            console.error('Error during file processing:', error)
            toast.error('Error processing file.')
        } finally {
            setIsCreatingItems(false)
            setCreationStepMessage('')
        }
    }

    //FORM submit: CREATE or UPDATE
    const handleFormSubmit = async (e) => {
        e.preventDefault()

        const additionalContext = { code: fieldValues.Code }
        const validationResults = validateFormFields(
            e,
            fieldNames,
            validators,
            setIsValid,
            setFieldErrors,
            additionalContext
        )

        if (!validationResults.isValid) return

        const normalizeNumericFields = (values) => ({
            ...values,
            LabNorm: parseFloat(values.LabNorm) || 0,
            LabUplift: parseFloat(values.LabUplift) || 0,
            MatNorm: parseFloat(values.MatNorm) || 0,
            SubConCost: parseFloat(values.SubConCost) || 0,
            SubConNorm: parseFloat(values.SubConNorm) || 0,
            PlantCost: parseFloat(values.PlantCost) || 0,
            GlandNorm: parseFloat(values.GlandNorm) || 0,
            TestNorm: parseFloat(values.TestNorm) || 0,
        })

        //Update/Edit Component case
        if (selectedComponent) {
            const { ID } = selectedComponent

            let fieldValuesToUpdate = normalizeNumericFields({
                ...fieldValues,
                Name: fieldValues.Name.trim(),
            })
            delete fieldValuesToUpdate.GlandNorm
            delete fieldValuesToUpdate.TestNorm

            await handleEditComponent(ID, fieldValuesToUpdate)
        } else {
            //Create Component case
            //Data of the new Component
            let baseComponentData = normalizeNumericFields({
                jobNo,
                ...fieldValues,
            })

            //Creates 2 extra Components when the code is 'cbs'
            if (fieldValues.Code === 'cbs') {
                if (!isComponentNameUnique(fieldValues.Name, componentsList)) {
                    toast.error('The Name of a cbs Component must be unique.')
                    return
                }

                await handleCreateComponent(baseComponentData)

                const termComponent = {
                    ...baseComponentData,
                    Name: baseComponentData.Name + ' Term',
                    LabNorm: baseComponentData.GlandNorm,
                }
                await handleCreateComponent(termComponent)

                const testComponent = {
                    ...baseComponentData,
                    Name: baseComponentData.Name + ' Test',
                    LabNorm: baseComponentData.TestNorm,
                }
                await handleCreateComponent(testComponent)

                setFieldValues((prevValues) => ({
                    ...prevValues,
                    GlandNorm: DEFAULT_VALUES.GlandNorm,
                    TestNorm: DEFAULT_VALUES.TestNorm,
                }))
            } else {
                if (
                    isNameUsedByCbsComponent(fieldValues.Name, componentsList)
                ) {
                    toast.error('This name is already used by a cbs Component.')
                    return
                }

                //Creates 1 Component otherwise
                await handleCreateComponent(baseComponentData)
            }

            setRestoreTableFocus({
                rowIndex: componentsList.length - 1,
                column: 'Name',
            })
        }
    }

    //CREATE Component logic
    const handleCreateComponent = async (componentData, showToast = true) => {
        if (componentData.Name) {
            componentData.Name = componentData.Name.trim()
        }

        if (componentData.Code === 'ttl') {
            componentData = {
                ...componentData,
                LabNorm: 0,
                LabUplift: 0,
                MatNorm: 0,
                SubConCost: 0,
                SubConNorm: 0,
                PlantCost: 0,
            }
        }

        const dataToSend = {
            ...componentData,
            LabNorm: parseFloat(componentData.LabNorm),
            LabUplift: parseFloat(componentData.LabUplift),
            MatNorm: parseFloat(componentData.MatNorm),
            SubConCost: parseFloat(componentData.SubConCost),
            SubConNorm: parseFloat(componentData.SubConNorm),
            PlantCost: parseFloat(componentData.PlantCost),
        }

        if (componentData.Code !== 'cbs') {
            delete dataToSend.GlandNorm
            delete dataToSend.TestNorm
        }

        try {
            const response = await fetch(generateProjectComponentsURL(jobNo), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            })

            if (response.status === 409) {
                const responseBody = await response.json()
                console.error('Conflict Error:', responseBody.message)
                if (showToast) toast.warning('This Component already exists.')
                return {
                    success: false,
                    error: responseBody.message,
                    statusCode: response.status,
                }
            } else if (!response.ok) {
                console.error(
                    'Error:',
                    'An error occurred while creating a new Component.'
                )
                if (showToast)
                    toast.error(
                        'An error occurred while creating a new Component.'
                    )
                const responseBody = await response.json()

                console.error('Error:', responseBody.message)

                return { success: false, error: responseBody.message }
            } else if (response.ok) {
                const newComponent = await response.json()

                if (showToast) toast.success(`Component successfully created!`)

                onComponentCreate(newComponent)
                setSelectedComponent(null)

                return { success: true, component: newComponent }
            }
        } catch (error) {
            console.error('Error:', error)
            if (showToast) toast.error(`Error: ${error.message}`)
            return { success: false, error: error.message }
        }
    }

    //Bulk CREATE Components logic
    const handleCreateComponentsOnFileUpload = async (componentsList) => {
        const processedData = componentsList.map((componentData) => {
            const defaultComponentData = {
                Code: componentData.Code,
                Name: componentData.Name,
                LabUplift: componentData.LabUplift || 0,
                MatNorm: componentData.MatNorm || 0,
                SubConCost: componentData.SubConCost || 0,
                SubConNorm: componentData.SubConNorm || 0,
                PlantCost: componentData.PlantCost || 0,
            }

            if (componentData.Name) {
                componentData.Name = componentData.Name.trim()
            }

            return {
                ...defaultComponentData,
                ...componentData,
            }
        })

        try {
            const response = await fetch(
                generateProjectComponentsBulkURL(jobNo),
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(processedData),
                }
            )

            const responseBody = await response.json()
            if (response.ok) {
                return { success: true, results: responseBody }
            } else {
                return {
                    success: false,
                    error: responseBody.message,
                    statusCode: response.status,
                }
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error(`Error: ${error.message}`)
            return { success: false, error: error.message }
        }
    }

    //UPDATE Component logic
    const handleEditComponent = async (
        componentToUpdate,
        fieldValuesToUpdate
    ) => {
        const rowIndex = componentsList.findIndex(
            (c) => c.ID === componentToUpdate
        )
        if (rowIndex === -1) return

        try {
            const url = updateComponentURL(jobNo, componentToUpdate)

            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fieldValuesToUpdate),
            })

            if (response.ok) {
                toast.success('Component successfully updated!')
                const updatedComponent = {
                    ...selectedComponent,
                    ...fieldValuesToUpdate,
                }

                onComponentUpdate(updatedComponent)
                setSelectedComponent(null)
                setFieldValues(DEFAULT_VALUES)

                setRestoreTableFocus({
                    rowIndex,
                    column: 'Name',
                })
            } else {
                const responseBody = await response.json()
                console.error('Updating Error:', responseBody.message)
                if (
                    response.status === 403 &&
                    responseBody.message.includes('cannot be edited')
                ) {
                    toast.warning(responseBody.message)
                } else {
                    toast.error('Error updating the Component.')
                }
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error:', error.message)
        }
    }

    //DELETE Component logic
    const handleDeleteComponent = async (componentToDelete) => {
        const rowIndex = componentsList.findIndex(
            (c) => c.ID === componentToDelete.ID
        )
        if (rowIndex === -1) return

        try {
            // If the component is a CBS component, delete its associated cable components
            if (componentToDelete.Code === 'cbs') {
                const associatedComponents = findAssociatedCableComponents(
                    componentToDelete.Name,
                    componentsList
                )

                for (const associatedComponent of associatedComponents) {
                    await fetch(
                        deleteComponentURL(jobNo, associatedComponent.ID),
                        {
                            method: 'DELETE',
                        }
                    )
                    onComponentDelete(associatedComponent)
                }
            }

            const response = await fetch(
                deleteComponentURL(jobNo, componentToDelete.ID),
                {
                    method: 'DELETE',
                }
            )

            if (response.ok) {
                toast.success('Component successfully deleted!')

                onComponentDelete(componentToDelete)
                setIsDeleteComponentDialogBoxOpen(false)
                setSelectedComponent(null)
                setFieldValues(DEFAULT_VALUES)

                const previousRowIndex = Math.max(0, rowIndex - 1)

                setRestoreTableFocus({
                    rowIndex: previousRowIndex,
                    column: 'Name',
                })
            } else {
                const responseBody = await response.json()
                toast.error(responseBody.message)
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error:', error.message)
        }
    }

    //Click on button Edit in the context menu + check if Component is editable
    const handleEditClick = async (componentData) => {
        try {
            //If the Component's code is 'cbs', prevent editing
            if (componentData.Code === 'cbs') {
                toast.warning("Components with code 'cbs' are not editable.")
                setIsEditable(false)
                return
            }

            const url = isComponentUsedInTemplateURL(jobNo, componentData.ID)
            const response = await fetch(url)

            if (response.status === 403) {
                toast.warning(
                    'This Component is used in a Template, only its Code can be edited.'
                )
                setIsUsedInTemplate(true)
            } else {
                setIsUsedInTemplate(false)
            }

            setSelectedComponent(componentData)
            setIsEditable(true)

            const updatedValues = {
                ...fieldValues,
                ...componentData,
            }

            setFieldValues(updatedValues)
        } catch (error) {
            console.error('Error checking component:', error)
            toast.error('An error occurred. Please try again.')
        }
    }

    //Click on button Cancel
    const handleCancelClick = () => {
        setIsValid({
            Code: true,
            Name: null,
            LabNorm: null,
            LabUplift: null,
            MatNorm: null,
            SubConCost: null,
            SubConNorm: null,
            PlantCost: null,
        })
        setFieldValues(DEFAULT_VALUES)
        setFieldErrors({})
        setSelectedComponent(null)
        setIsUsedInTemplate(false)
    }

    const handleContextMenuOptionClick = async (option, rowData) => {
        switch (option.action) {
            case 'editComponent':
                handleEditClick(rowData)
                break
            case 'deleteComponent':
                if (
                    rowData.Name.includes('Term') ||
                    rowData.Name.includes('Test')
                ) {
                    toast.warning(
                        "Components Term or Test can't be deleted individually, please deal with the base Component instead."
                    )
                    return
                }
                openDeleteComponentDialogBox(rowData)
                break
        }
    }

    //If option "Delete Component" is clicked in the context menu
    const openDeleteComponentDialogBox = async (rowData) => {
        try {
            const url = isComponentUsedInTemplateURL(jobNo, rowData.Name)
            const response = await fetch(url)

            if (response.status === 403) {
                toast.error(
                    'This Component is used in a Template, it cannot be deleted.'
                )
                return
            }

            setCurrentComponentData(rowData)
            setIsDeleteComponentDialogBoxOpen(true)
        } catch (error) {
            console.error('Error checking component:', error)
            toast.error('An error occurred. Please try again.')
        }
    }

    // 4. useEffects
    useEffect(() => {
        if (componentsTableGridApi && quickFilterText !== null) {
            componentsTableGridApi.updateGridOptions({ quickFilterText })
        }
    }, [componentsTableGridApi, quickFilterText])

    useEffect(() => {
        fetchComponentsList(jobNo)
        fetchCodesList()
    }, [jobNo, fetchComponentsList, fetchCodesList])

    useEffect(() => {
        if (isLoading) {
            componentsTableGridApi?.showLoadingOverlay()
        } else componentsTableGridApi?.hideOverlay()
    }, [componentsList, componentsTableGridApi, isLoading])

    useEffect(() => {
        if (
            restoreTableFocus &&
            componentsTableGridApi &&
            restoreTableFocus.rowIndex > 0
        ) {
            const { rowIndex, column } = restoreTableFocus
            componentsTableGridApi.ensureIndexVisible(rowIndex, 'middle')
            componentsTableGridApi.setFocusedCell(rowIndex, column)

            setRestoreTableFocus(null)
        }
    }, [restoreTableFocus, componentsTableGridApi])

    return (
        <>
            {isCreatingItems && (
                <MainLoaderOverlayContainer>
                    <Overlay />
                    <CreationStepMessageContainer>
                        {creationStepMessage}
                    </CreationStepMessageContainer>
                    <MainLoader />
                </MainLoaderOverlayContainer>
            )}
            <ComponentsViewContainer>
                <ComponentsDataContainer>
                    <LabelAndInputContainer>
                        <span className="grey-label">Components List</span>
                        <input
                            className="quick-filter-input purple"
                            type="text"
                            placeholder="Search in all columns..."
                            value={quickFilterText}
                            onChange={(e) => setQuickFilterText(e.target.value)}
                        />
                    </LabelAndInputContainer>
                    <div style={{ height: 'calc(100% - 32px)' }}>
                        <StyledAGGrid
                            className="ag-theme-quartz purple-table"
                            gridOptions={componentsTableGridOptions}
                            rowData={componentsList}
                        />
                    </div>
                </ComponentsDataContainer>
                <CreateComponentAndFileUploadContainer>
                    <CreateComponentContainer>
                        <span className="purple-label">
                            {' '}
                            {!selectedComponent
                                ? 'Create a new Component'
                                : 'Edit Component'}
                        </span>
                        <CreateComponentForm onSubmit={handleFormSubmit}>
                            <FieldsWrapper>
                                <CreateComponentFormFieldsContainer>
                                    <FirstRowContainer>
                                        <CreateComponentFormField>
                                            <LabelInputContainer>
                                                <label htmlFor="Code">
                                                    Code
                                                </label>
                                                <select
                                                    id="Code"
                                                    value={fieldValues.Code}
                                                    onChange={handleInputChange}
                                                    className={
                                                        selectedComponent &&
                                                        selectedComponent.Code ===
                                                            'cbs'
                                                            ? 'disabled-field'
                                                            : ''
                                                    }
                                                    disabled={!isEditable}
                                                >
                                                    {codesList
                                                        .filter(
                                                            (codeItem) =>
                                                                selectedComponent ==
                                                                    null ||
                                                                codeItem.Code !==
                                                                    'cbs'
                                                        )
                                                        .map((codeItem) => (
                                                            <option
                                                                key={
                                                                    codeItem.Code
                                                                }
                                                                value={
                                                                    codeItem.Code
                                                                }
                                                            >
                                                                {codeItem.Code}
                                                            </option>
                                                        ))}
                                                </select>
                                            </LabelInputContainer>
                                            <span className="codeName">
                                                Code Name:{' '}
                                                {
                                                    codesList.find(
                                                        (item) =>
                                                            item.Code ===
                                                            fieldValues.Code
                                                    )?.Name
                                                }
                                            </span>
                                        </CreateComponentFormField>
                                        <CreateComponentFormField className="nameField">
                                            <LabelInputContainer
                                                style={{ width: '100%' }}
                                            >
                                                <label htmlFor="Name">
                                                    Name
                                                </label>
                                                <input
                                                    id="Name"
                                                    value={fieldValues.Name}
                                                    onChange={handleInputChange}
                                                    className={
                                                        isUsedInTemplate
                                                            ? 'disabled-field'
                                                            : fieldClasses.Name
                                                    }
                                                    type="text"
                                                    placeholder="Max. 180 characters"
                                                    minLength={3}
                                                    maxLength={180}
                                                    disabled={
                                                        !isEditable ||
                                                        isUsedInTemplate
                                                    }
                                                />
                                            </LabelInputContainer>
                                            {fieldErrors['Name'] && (
                                                <ErrorMessage>
                                                    {fieldErrors['Name']}
                                                </ErrorMessage>
                                            )}
                                        </CreateComponentFormField>
                                        <CreateComponentFormField>
                                            <LabelInputContainer>
                                                <label htmlFor="LabNorm">
                                                    Lab Norm
                                                </label>
                                                <input
                                                    id="LabNorm"
                                                    value={fieldValues.LabNorm}
                                                    onChange={handleInputChange}
                                                    className={
                                                        fieldValues.Code ===
                                                            'ttl' ||
                                                        isUsedInTemplate
                                                            ? 'disabled'
                                                            : fieldClasses.LabNorm
                                                    }
                                                    type="number"
                                                    step={0.01}
                                                    placeholder="0"
                                                    disabled={
                                                        fieldValues.Code ===
                                                            'ttl' ||
                                                        isUsedInTemplate
                                                    }
                                                />
                                            </LabelInputContainer>
                                            {fieldErrors['LabNorm'] && (
                                                <ErrorMessage>
                                                    {fieldErrors['LabNorm']}
                                                </ErrorMessage>
                                            )}
                                        </CreateComponentFormField>
                                    </FirstRowContainer>
                                    <SecondRowContainer>
                                        <CreateComponentFormField>
                                            <LabelInputContainer>
                                                <label htmlFor="LabUplift">
                                                    Lab Uplift
                                                </label>
                                                <input
                                                    id="LabUplift"
                                                    value={
                                                        fieldValues.LabUplift
                                                    }
                                                    onChange={handleInputChange}
                                                    className={
                                                        fieldValues.Code ===
                                                            'ttl' ||
                                                        isUsedInTemplate
                                                            ? 'disabled'
                                                            : fieldClasses.LabUplift
                                                    }
                                                    type="number"
                                                    step={0.01}
                                                    placeholder="0"
                                                    disabled={
                                                        fieldValues.Code ===
                                                            'ttl' ||
                                                        isUsedInTemplate
                                                    }
                                                />
                                            </LabelInputContainer>
                                            {fieldErrors['LabUplift'] && (
                                                <ErrorMessage>
                                                    {fieldErrors['LabUplift']}
                                                </ErrorMessage>
                                            )}
                                        </CreateComponentFormField>

                                        <CreateComponentFormField>
                                            <LabelInputContainer>
                                                <label htmlFor="MatNorm">
                                                    Mat Norm
                                                </label>
                                                <input
                                                    id="MatNorm"
                                                    value={fieldValues.MatNorm}
                                                    onChange={handleInputChange}
                                                    className={
                                                        fieldValues.Code ===
                                                            'ttl' ||
                                                        isUsedInTemplate
                                                            ? 'disabled'
                                                            : fieldClasses.MatNorm
                                                    }
                                                    type="number"
                                                    step={0.01}
                                                    placeholder="0"
                                                    disabled={
                                                        fieldValues.Code ===
                                                            'ttl' ||
                                                        isUsedInTemplate
                                                    }
                                                />
                                            </LabelInputContainer>
                                            {fieldErrors['MatNorm'] && (
                                                <ErrorMessage>
                                                    {fieldErrors['MatNorm']}
                                                </ErrorMessage>
                                            )}
                                        </CreateComponentFormField>
                                        <CreateComponentFormField>
                                            <LabelInputContainer>
                                                <label htmlFor="SubConCost">
                                                    S/C Cost
                                                </label>
                                                <input
                                                    id="SubConCost"
                                                    value={
                                                        fieldValues.SubConCost
                                                    }
                                                    onChange={handleInputChange}
                                                    className={
                                                        fieldValues.Code ===
                                                            'ttl' ||
                                                        isUsedInTemplate
                                                            ? 'disabled'
                                                            : fieldClasses.SubConCost
                                                    }
                                                    type="number"
                                                    step={0.01}
                                                    placeholder="0"
                                                    disabled={
                                                        fieldValues.Code ===
                                                            'ttl' ||
                                                        isUsedInTemplate
                                                    }
                                                />
                                            </LabelInputContainer>
                                            {fieldErrors['SubConCost'] && (
                                                <ErrorMessage>
                                                    {fieldErrors['SubConCost']}
                                                </ErrorMessage>
                                            )}
                                        </CreateComponentFormField>
                                        <CreateComponentFormField>
                                            <LabelInputContainer>
                                                <label htmlFor="SubConNorm">
                                                    S/C Norm
                                                </label>
                                                <input
                                                    id="SubConNorm"
                                                    value={
                                                        fieldValues.SubConNorm
                                                    }
                                                    onChange={handleInputChange}
                                                    className={
                                                        fieldValues.Code ===
                                                            'ttl' ||
                                                        isUsedInTemplate
                                                            ? 'disabled'
                                                            : fieldClasses.SubConNorm
                                                    }
                                                    type="number"
                                                    step={0.01}
                                                    placeholder="0"
                                                    disabled={
                                                        fieldValues.Code ===
                                                            'ttl' ||
                                                        isUsedInTemplate
                                                    }
                                                />
                                            </LabelInputContainer>
                                            {fieldErrors['SubConNorm'] && (
                                                <ErrorMessage>
                                                    {fieldErrors['SubConNorm']}
                                                </ErrorMessage>
                                            )}
                                        </CreateComponentFormField>
                                        <CreateComponentFormField>
                                            <LabelInputContainer>
                                                <label htmlFor="PlantCost">
                                                    Plant Cost
                                                </label>
                                                <input
                                                    id="PlantCost"
                                                    value={
                                                        fieldValues.PlantCost
                                                    }
                                                    onChange={handleInputChange}
                                                    className={
                                                        fieldValues.Code ===
                                                            'ttl' ||
                                                        isUsedInTemplate
                                                            ? 'disabled'
                                                            : fieldClasses.PlantCost
                                                    }
                                                    type="number"
                                                    step={0.01}
                                                    placeholder="0"
                                                    disabled={
                                                        fieldValues.Code ===
                                                            'ttl' ||
                                                        isUsedInTemplate
                                                    }
                                                />
                                            </LabelInputContainer>
                                            {fieldErrors['PlantCost'] && (
                                                <ErrorMessage>
                                                    {fieldErrors['PlantCost']}
                                                </ErrorMessage>
                                            )}
                                        </CreateComponentFormField>
                                    </SecondRowContainer>
                                </CreateComponentFormFieldsContainer>
                                <CreateComponentExtraFieldsContainer>
                                    <label className="CreateComponentForm-label cable">
                                        Schedule Cable
                                    </label>
                                    <CreateComponentFormField>
                                        <LabelInputContainer className="cableFields">
                                            <label
                                                htmlFor="GlandNorm"
                                                className={
                                                    fieldValues.Code !== 'cbs'
                                                        ? 'disabled'
                                                        : ''
                                                }
                                            >
                                                Gland Norm
                                            </label>
                                            <input
                                                id="GlandNorm"
                                                value={fieldValues.GlandNorm}
                                                onChange={handleInputChange}
                                                className={
                                                    fieldClasses.GlandNorm
                                                }
                                                type="number"
                                                step={0.01}
                                                disabled={
                                                    fieldValues.Code !==
                                                        'cbs' ||
                                                    selectedComponent
                                                }
                                            />
                                        </LabelInputContainer>
                                        {fieldErrors['GlandNorm'] && (
                                            <ErrorMessage>
                                                {fieldErrors['GlandNorm']}
                                            </ErrorMessage>
                                        )}
                                    </CreateComponentFormField>
                                    <CreateComponentFormField>
                                        <LabelInputContainer className="cableFields">
                                            <label
                                                htmlFor="TestNorm"
                                                className={
                                                    fieldValues.Code !== 'cbs'
                                                        ? 'disabled'
                                                        : ''
                                                }
                                            >
                                                Test Norm
                                            </label>
                                            <input
                                                id="TestNorm"
                                                value={fieldValues.TestNorm}
                                                onChange={handleInputChange}
                                                className={
                                                    fieldClasses.TestNorm
                                                }
                                                type="number"
                                                step={0.01}
                                                disabled={
                                                    fieldValues.Code !==
                                                        'cbs' ||
                                                    selectedComponent
                                                }
                                            />
                                        </LabelInputContainer>
                                        {fieldErrors['TestNorm'] && (
                                            <ErrorMessage>
                                                {fieldErrors['TestNorm']}
                                            </ErrorMessage>
                                        )}
                                    </CreateComponentFormField>
                                    <label className="CreateComponentForm-label--bottom cable">
                                        Code: cbs
                                    </label>
                                </CreateComponentExtraFieldsContainer>
                            </FieldsWrapper>

                            <ButtonsContainer>
                                <FormButton type="submit" variant="submit">
                                    {selectedComponent ? 'Update' : 'Create'}
                                </FormButton>
                                <FormButton
                                    type="reset"
                                    variant="cancel"
                                    onClick={handleCancelClick}
                                >
                                    Cancel
                                </FormButton>
                            </ButtonsContainer>
                        </CreateComponentForm>
                    </CreateComponentContainer>
                    <FileUploadContainer>
                        <span className="purple-label">
                            Load Component(s) from File
                        </span>
                        <div className="file-content">
                            <FileUploadButton onChange={handleFileUpload} />
                            <span className="file-loaded-indicator">
                                File should be Components_Template.xlsx
                            </span>
                        </div>
                    </FileUploadContainer>
                </CreateComponentAndFileUploadContainer>
            </ComponentsViewContainer>
        </>
    )
}

export default ComponentsView
