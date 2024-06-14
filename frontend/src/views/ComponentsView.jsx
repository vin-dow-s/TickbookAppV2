//Modules
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'

//Hooks
import useStore from '../hooks/useStore'

//Utils
import { isComponentUsedInTemplateURL } from '../utils/apiConfig'
import { onCellContextMenu } from '../utils/gridUtils'
import { componentValidators } from '../utils/validationFormFields'

//Helpers
import {
    createCbsComponents,
    fieldClasses,
    isNameUsedByCbsComponent,
    normalizeNumericFields,
    validateComponentFields,
} from '../helpers/componentHelpers'

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
import DeleteComponentDialogBox from '../components/DialogBoxes/DeleteComponentDialogBox'

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

    .createComponentForm-label {
        position: absolute;
        top: -8px;
        padding: 0 5px;
        background-color: white;
        color: ${colors.purpleBgenDarker};
        font-style: italic;

        &.inactive {
            color: grey;
            cursor: default;
        }
    }

    .createComponentForm-label--bottom {
        position: absolute;
        bottom: -6px;
        padding: 0 5px;
        background-color: white;
        color: ${colors.purpleBgenDarker};
        font-style: italic;

        &.inactive {
            color: grey;
            cursor: default;
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
    //1. State declarations
    const {
        jobNo,
        componentsList,
        codesList,
        isLoading,
        fetchComponentsList,
        fetchCodesList,
        onComponentCreate,
        onComponentUpdate,
        handleComponentFileUpload,
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
        handleComponentFileUpload: state.handleComponentFileUpload,
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
    const fieldClassesComputed = fieldClasses(fieldErrors, fieldValues)

    const componentsTableGridOptions = {
        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true,
        },
        columnDefs: columnsComponents,
        rowSelection: 'single',
        onCellContextMenu: (params) =>
            onCellContextMenu(params, setContextMenuState),
        overlayLoadingTemplate: overlayLoadingTemplatePurple,
        onGridReady: (params) => {
            setComponentsTableGridApi(params.api)
            params.api.updateGridOptions({ rowData: componentsList })
        },
    }

    //3. Event handlers
    const handleInputChange = (e) => {
        const { id, value } = e.target
        const trimmedValue = value.trim()

        // Dynamically check the input against the regex pattern and set error message
        const errorMessage = componentValidators[id]
            ? componentValidators[id](trimmedValue)
            : ''
        setFieldErrors((prevErrors) => ({ ...prevErrors, [id]: errorMessage }))

        // Update field values
        setFieldValues((prevValues) => ({ ...prevValues, [id]: value }))
    }

    const handleComponentFileUploadWrapper = async (event) => {
        setIsCreatingItems(true)
        setCreationStepMessage('Reading Excel file...')

        try {
            const file = event.target.files[0]
            const { bulkCreateResult, jsonDataLength, nonExistingCodes } =
                await handleComponentFileUpload(
                    jobNo,
                    file,
                    codesList,
                    setCreationStepMessage
                )

            toast.info(`Processed ${jsonDataLength} lines.`)

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
                    jsonDataLength !== alreadyExists.length
                ) {
                    toast.warning(
                        `${alreadyExists.length} Component(s) already exist.`
                    )
                }

                if (success.length > 0) {
                    toast.success(
                        `${success.length} Component(s) successfully created.`
                    )

                    setRestoreTableFocus({
                        rowIndex: componentsList.length - 1,
                        column: 'Name',
                    })
                }

                if (failures.length > 0) {
                    const failureLineNumbers = failures
                        .map((f) => f.lineNumber)
                        .join(', ')
                    toast.error(
                        `${failures.length} error(s). Please check your file on lines: ${failureLineNumbers}.`
                    )
                }

                if (alreadyExists.length === jsonDataLength)
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

    //FORM submit: CREATE or UPDATE Component
    const handleFormSubmit = async (e) => {
        e.preventDefault()

        if (
            !validateComponentFields(
                e,
                fieldNames,
                componentValidators,
                setIsValid,
                setFieldErrors,
                fieldValues
            )
        )
            return

        const normalizedValues = normalizeNumericFields(fieldValues)

        if (selectedComponent) {
            handleComponentUpdate(selectedComponent.ID, normalizedValues)
        } else {
            handleComponentCreate(normalizedValues)
        }
    }

    const handleComponentUpdate = async (ID, normalizedValues) => {
        let fieldValuesToUpdate = {
            ...normalizedValues,
            Name: normalizedValues.Name.trim(),
        }
        delete fieldValuesToUpdate.GlandNorm
        delete fieldValuesToUpdate.TestNorm

        const result = await onComponentUpdate(jobNo, ID, fieldValuesToUpdate)
        if (result) {
            toast.success('Component successfully updated.')
            handleCancelClick()
            setRestoreTableFocus({
                rowIndex: componentsList.findIndex((c) => c.ID === ID),
                column: 'Name',
            })
            return true
        } else {
            toast.error('Error updating the Component.')
            return false
        }
    }

    const handleComponentCreate = async (componentData) => {
        if (fieldValues.Code === 'cbs') {
            const success = await createCbsComponents(
                jobNo,
                componentData,
                fieldValues,
                componentsList,
                onComponentCreate
            )
            if (success) {
                setFieldValues((prevValues) => ({
                    ...prevValues,
                    GlandNorm: DEFAULT_VALUES.GlandNorm,
                    TestNorm: DEFAULT_VALUES.TestNorm,
                }))
            }
        } else {
            if (isNameUsedByCbsComponent(fieldValues.Name, componentsList)) {
                toast.error('This name is already used by a cbs Component.')
                return
            }

            const result = await onComponentCreate(jobNo, componentData)
            if (result.success) {
                toast.success('Component successfully created.')
                setRestoreTableFocus({
                    rowIndex: componentsList.length - 1,
                    column: 'Name',
                })
            } else if (result.statusCode === 409) {
                toast.warning('This Component already exists.')
            } else {
                toast.error('Error creating the Component.')
                return
            }
        }
    }

    //If option "Edit Component" is clicked in the context menu + check if Component is editable
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
                        "Components Term or Test can't be deleted individually, delete the base Component instead."
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
            const url = isComponentUsedInTemplateURL(jobNo, rowData.ID)
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
        if (jobNo) fetchComponentsList(jobNo)
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
                    {contextMenuState.visible && (
                        <ContextMenu
                            position={{
                                top: contextMenuState.position.y,
                                left: contextMenuState.position.x,
                            }}
                            data={contextMenuState.rowData}
                            options={contextMenuOptions.componentsTable}
                            onClose={() =>
                                setContextMenuState({
                                    ...contextMenuState,
                                    visible: false,
                                })
                            }
                            onOptionClick={(option) =>
                                handleContextMenuOptionClick(
                                    option,
                                    contextMenuState.rowData
                                )
                            }
                        />
                    )}
                </ComponentsDataContainer>
                <CreateComponentAndFileUploadContainer>
                    <CreateComponentContainer>
                        <div className="purple-label">
                            {' '}
                            {!selectedComponent
                                ? 'Create a new Component'
                                : 'Edit Component'}
                        </div>
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
                                                            : fieldClassesComputed.Name
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
                                                            : fieldClassesComputed.LabNorm
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
                                                            : fieldClassesComputed.LabUplift
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
                                                            : fieldClassesComputed.MatNorm
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
                                                            : fieldClassesComputed.SubConCost
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
                                                            : fieldClassesComputed.SubConNorm
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
                                                            : fieldClassesComputed.PlantCost
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
                                    <div
                                        className={`createComponentForm-label ${
                                            fieldValues.Code === 'cbs'
                                                ? 'active'
                                                : 'inactive'
                                        }`}
                                    >
                                        Schedule Cable
                                    </div>
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
                                                    fieldClassesComputed.GlandNorm
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
                                                    fieldClassesComputed.TestNorm
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
                                    <div
                                        className={`createComponentForm-label--bottom ${
                                            fieldValues.Code === 'cbs'
                                                ? 'active'
                                                : 'inactive'
                                        }`}
                                    >
                                        Code: cbs
                                    </div>
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
                        <div className="purple-label">
                            Load Component(s) from File
                        </div>
                        <div className="file-content">
                            <FileUploadButton
                                onChange={handleComponentFileUploadWrapper}
                            />
                            <span className="file-loaded-indicator">
                                File should be Components_Template.xlsx
                            </span>
                        </div>
                    </FileUploadContainer>
                </CreateComponentAndFileUploadContainer>
                {/* Displays DeleteComponentDialogBox when "Delete" context menu option is clicked in MainTable */}
                {isDeleteComponentDialogBoxOpen && (
                    <DeleteComponentDialogBox
                        jobNo={jobNo}
                        componentData={currentComponentData}
                        onClose={() => setIsDeleteComponentDialogBoxOpen(false)}
                        setRestoreTableFocus={setRestoreTableFocus}
                    />
                )}
            </ComponentsViewContainer>
        </>
    )
}

export default ComponentsView
