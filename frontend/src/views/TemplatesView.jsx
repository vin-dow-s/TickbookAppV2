//Modules
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'

//Hooks
import useStore from '../hooks/useStore'

//Utils
import {
    generateProjectComponentsBulkURL,
    generateProjectEquipmentBulkURL,
    generateProjectNonCBSComponentsWithLabnormsURL,
    generateProjectTemplatesBulkURL,
    generateProjectTemplatesURL,
    generateTemplateComponentsURL,
} from '../utils/apiConfig'
import { onCellContextMenu } from '../utils/gridUtils'
import {
    getClassForField,
    validateField,
    validateFormFields,
} from '../utils/validationFormFields'
import {
    componentsNamePattern,
    onlyFloatsPattern,
    templatesNamePattern,
} from '../utils/regexPatterns'
import { readExcelFile } from '../utils/readExcelFile'

//Helpers

//Styles and constants
import { Overlay } from '../styles/dialog-boxes'
import { colors } from '../styles/global-styles'
import { StyledAGGrid } from '../styles/tables'
import {
    columnsComponentsInProject,
    columnsComponentsInSelectedTemplate,
    columnsTemplates,
} from '../constants/dialog-box-tables-columns'
import { contextMenuOptions } from '../constants/context-menu'

//Assets
import ArrowDown from '../assets/arrow-down-line.svg'
import ArrowUp from '../assets/arrow-up-line.svg'

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

const TemplatesViewContainer = styled.div`
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

const TemplatesAndComponentsContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: row;
    flex: 1;
    gap: 25px;
    width: 100%;

    label {
        width: 300px;
        top: 45px;
        font-size: small;
        font-style: italic;
        color: ${colors.purpleBgenDarker};
    }
`

const CreateTemplateForm = styled(FormBase)`
    flex: 1.5;
    background-color: white;
    color: black;
    border-radius: 10px;
    padding: 10px;
`

const ComponentsInTemplateWrapper = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 160px;
`

const FieldsWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
`

const ComponentsWrapper = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1.5;
`

const SelectedComponentsWrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: calc(39vh - 35px);
    max-height: calc(39vh - 35px);
    border-radius: 5px;
    overflow-y: auto;
    overflow-x: hidden;
    border: 1px dashed ${colors.tablesBorders};
    scroll-behavior: smooth;
`

const SelectComponentMessage = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0;
    color: darkgray;
    text-align: center;
`

const SelectedComponentRow = styled.div`
    display: flex;
    padding: 5px;
    margin: 0;
    justify-content: space-between;
    overflow: hidden;
    opacity: 0;
    flex-shrink: 0;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.15s, transform 0.15s ease-in;
    transform: translateY(-10px);

    ${(props) =>
        props.$animationstate === 'entering' &&
        `
        max-height: 0;
        transform: translateY(-10px);
        opacity: 0;
    `}

    ${(props) =>
        props.$animationstate === 'entered' &&
        `
        max-height: 55px;
        transform: translateY(0);
        opacity: 1;
    `}

    ${(props) =>
        props.$animationstate === 'exiting' &&
        `
        transform: translateX(50%);
        opacity: 0;
        transition: all 0.3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
    `}

    span {
        transition: all 0.3s, transform 0.3s ease-in;

        &:hover {
            color: #e74c3c;
        }
    }

    img {
        border: 1px solid ${colors.darkBlueBgenTransparent};
        border-radius: 25px;
        height: 15px;
        max-height: 15px;
        justify-content: right;
    }
`

const TemplatesFieldsContainer = styled(FieldsContainer)`
    flex-direction: row;
    gap: 10px;
    align-items: center;
`

const TemplatesFormField = styled(FormField)`
    position: relative;
    flex-direction: row;
    align-items: flex-start;

    label {
        display: flex;
        flex-direction: row;
    }

    input {
        width: max-content;
    }

    .disabled-code {
        color: ${colors.tablesBorders};
    }

    .codeName {
        position: absolute;
        width: 300px;
        top: 45px;
        font-size: smaller;
        color: ${colors.purpleBgenDarker};
    }

    .wholeEstimate {
        align-self: center;
        align-items: center;
    }
`

const TemplatesWrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
`

const ClearAllButton = styled.button`
    background-color: white;
    color: ${colors.purpleBgen};
    border: 1px solid ${colors.purpleBgen};
    border-radius: 5px;
    padding: 5px 15px;
    height: 28px;
    margin-top: 5px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
        color: #e74c3c;
        border-color: #e74c3c;
    }
`

const ShowTemplatesContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex: 1;
    gap: 10px;
    padding: 10px;
    background-color: white;
    color: black;
    border-radius: 10px;
`

const TemplatesView = () => {
    //1. State declarations
    const {
        jobNo,
        templatesList,
        equipmentList,
        isLoading,
        fetchTemplatesList,
        fetchEquipmentList,
        fetchCodesList,
        onComponentCreate,
        onComponentUpdate,
        handleComponentFileUpload,
    } = useStore((state) => ({
        jobNo: state.jobNo,
        templatesList: state.templatesList,
        equipmentList: state.equipmentList,
        isLoading: state.isLoading,
        fetchTemplatesList: state.fetchTemplatesList,
        fetchEquipmentList: state.fetchEquipmentList,
        onComponentCreate: state.onComponentCreate,
        onComponentsBulkCreate: state.onComponentsBulkCreate,
        onComponentUpdate: state.onComponentUpdate,
        handleComponentFileUpload: state.handleComponentFileUpload,
    }))
    const [
        componentsInProjectTableGridApi,
        setComponentsInProjectTableGridApi,
    ] = useState(null)
    const [templatesTableGridApi, setTemplatesTableGridApi] = useState(null)
    const [, setComponentsInSelectedTemplateTableGridApi] = useState(null)
    const [contextMenuState, setContextMenuState] = useState({
        visible: false,
        position: { x: 0, y: 0 },
        rowData: null,
    })
    const [, setIsValid] = useState({
        EquipTemplate: null,
        Component: null,
    })
    const [fieldErrors, setFieldErrors] = useState({
        EquipTemplate: '',
        Component: '',
    })
    const [fieldValues, setFieldValues] = useState({
        Name: '',
        WholeEstimate: false,
    })
    const fieldNames = ['Name']
    const [componentsInProject, setComponentsInProject] = useState([])
    const [isLoadingComponents, setIsLoadingComponents] = useState(true)
    const [selectedComponents, setSelectedComponents] = useState([])
    const [selectedTemplate, setSelectedTemplate] = useState(null)
    const [componentsInTemplate, setComponentsInTemplate] = useState([])
    const [componentAnimations, setComponentAnimations] = useState({})
    const [componentAdded, setComponentAdded] = useState(false)
    const selectedComponentsWrapperRef = useRef(null)
    const [isEditTemplateDialogBoxOpen, setIsEditTemplateDialogBoxOpen] =
        useState(false)
    const [templateUpdated, setTemplateUpdated] = useState(false)
    const [isFileUploadOpen, setIsFileUploadOpen] = useState(false)
    const [isCreatingItems, setIsCreatingItems] = useState(false)
    const [creationStepMessage, setCreationStepMessage] = useState('')

    //Updates selectedComponents on click in "Components in Project"
    const handleComponentSelect = (event) => {
        const clickedComponent = event.data
        const componentExists = selectedComponents.some(
            (component) => component.ID === clickedComponent.ID
        )

        if (componentExists) {
            setSelectedComponents((prevComponents) =>
                prevComponents.filter(
                    (component) => component.ID !== clickedComponent.ID
                )
            )
        } else {
            setSelectedComponents((prevComponents) => [
                ...prevComponents,
                {
                    ...clickedComponent,
                    uid: `uid-${Date.now()}-${clickedComponent.ID}`,
                },
            ])
        }
    }

    const handleTemplateSelect = async (event) => {
        const selectedTemplateData = event.data
        setSelectedTemplate(selectedTemplateData)
        getTemplateComponents(selectedTemplateData.Name)
    }

    const componentsInProjectTableGridOptions = {
        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true,
        },
        columnDefs: columnsComponentsInProject,
        rowSelection: 'single',
        overlayLoadingTemplate: overlayLoadingTemplatePurple,
        onGridReady: (params) => {
            setComponentsInProjectTableGridApi(params.api)
            params.api.updateGridOptions({ rowData: componentsInProject })
        },
        onRowClicked: handleComponentSelect,
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

    const templatesTableGridOptions = {
        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true,
        },
        columnDefs: columnsTemplates,
        rowSelection: 'single',
        overlayLoadingTemplate: overlayLoadingTemplatePurple,
        onGridReady: (params) => {
            setTemplatesTableGridApi(params.api)
            params.api.updateGridOptions({ rowData: templatesList })
        },
        onRowClicked: handleTemplateSelect,
        onCellContextMenu: onCellContextMenu,
    }

    const componentsInSelectedTemplateTableGridOptions = {
        defaultColDef: {
            resizable: true,
        },
        columnDefs: columnsComponentsInSelectedTemplate,
        overlayLoadingTemplate: overlayLoadingTemplatePurple,
        onGridReady: (params) => {
            setComponentsInSelectedTemplateTableGridApi(params.api)
            params.api.updateGridOptions({ rowData: filteredComponents })
        },
        overlayNoRowsTemplate: 'Select a Template.',
    }

    const signalTemplateUpdate = () => {
        setTemplateUpdated((prevState) => !prevState)
    }

    //Opens the loading file box
    const toggleFileUpload = () => {
        setIsFileUploadOpen(!isFileUploadOpen)
    }

    const groupComponentsByTempNameAndReturnsComponentsToCreate = (
        jsonData
    ) => {
        let componentsToCreate = []
        const templatesMap = new Map()
        const equipQtyConsistencyMap = new Map()
        const inconsistentTemplateEquipQty = new Set()

        jsonData.forEach((row) => {
            // Add to componentsToCreate if the component does not exist
            if (
                !componentsInProject.some(
                    (comp) =>
                        comp.Name === row.Component &&
                        comp.LabNorm === row.LabNorm
                )
            ) {
                componentsToCreate.push({ ...row, LabNorm: row.LabNorm })
            }

            // Group components by Template Name
            const templateComponents = templatesMap.get(row.Name) || []
            templateComponents.push({
                component: row.Component,
                labNorm: row.LabNorm,
                equipQty: row.EquipQty,
                inOrder: row.InOrder,
                rowNum: row.__rowNum__,
            })
            templatesMap.set(row.Name, templateComponents)

            // Check EquipQty consistency
            if (equipQtyConsistencyMap.has(row.Name)) {
                if (equipQtyConsistencyMap.get(row.Name) !== row.EquipQty) {
                    inconsistentTemplateEquipQty.add(row.Name)
                }
            } else {
                equipQtyConsistencyMap.set(row.Name, row.EquipQty)
            }
        })

        return {
            componentsToCreate,
            templatesMap,
            inconsistentTemplateEquipQty,
        }
    }

    const deduplicateComponents = (components) => {
        const uniqueComponents = new Map()

        components.forEach((component) => {
            const uniqueKey = `${component.Component}-${component.LabNorm}`

            if (!uniqueComponents.has(uniqueKey)) {
                uniqueComponents.set(uniqueKey, component)
            }
        })
        return Array.from(uniqueComponents.values())
    }

    //CREATE Components + Templates + Equipment on file upload
    const handleFileUpload = async (event) => {
        setIsCreatingItems(true)
        setCreationStepMessage('Reading Excel file...')

        try {
            const file = event.target.files[0]
            const jsonData = await readExcelFile(file)

            let missingValues = []
            let invalidComponentFormat = []
            let invalidLabNormFormat = []
            let invalidTempNameFormat = []
            let errorMessages = []
            let componentsMap = new Map()

            //Validate each row before proceeding with the creation
            jsonData.forEach((row, index) => {
                Object.keys(row).forEach((key) => {
                    if (typeof row[key] === 'string') {
                        row[key] = row[key].trim()
                    }
                })

                const uniqueKey = `${row.Name}-${row.Component}-${row.LabNorm}`
                if (!row.Name || !row.Component || row.LabNorm === undefined) {
                    missingValues.push(index + 2)
                } else if (!templatesNamePattern.test(row.Name)) {
                    invalidTempNameFormat.push(index + 2)
                } else if (!componentsNamePattern.test(row.Component)) {
                    invalidComponentFormat.push(index + 2)
                } else if (!onlyFloatsPattern.test(row.LabNorm.toString())) {
                    invalidLabNormFormat.push(index + 2)
                } else {
                    componentsMap.set(uniqueKey, row)
                }
            })

            if (missingValues.length > 0) {
                errorMessages.push(
                    `missing values on lines ${missingValues.join(', ')}`
                )
            }

            if (invalidComponentFormat.length > 0) {
                errorMessages.push(
                    `invalid Component name on lines ${invalidComponentFormat.join(
                        ', '
                    )}`
                )
            }
            if (invalidLabNormFormat.length > 0) {
                errorMessages.push(
                    `invalid LabNorm on lines ${invalidLabNormFormat.join(
                        ', '
                    )}`
                )
            }
            if (invalidTempNameFormat.length > 0) {
                errorMessages.push(
                    `invalid Name on lines ${invalidTempNameFormat.join(', ')}`
                )
            }

            if (errorMessages.length > 0) {
                toast.error(
                    `Creation aborted because of the following errors: ${errorMessages.join(
                        '; '
                    )}.`
                )
                setIsCreatingItems(false)
                return
            }

            setCreationStepMessage('Creating Components...')

            const {
                componentsToCreate,
                templatesMap,
                inconsistentTemplateEquipQty,
            } = groupComponentsByTempNameAndReturnsComponentsToCreate(jsonData)

            if (inconsistentTemplateEquipQty.size > 0) {
                toast.error(
                    `Inconsistent EquipQty found in Templates: ${Array.from(
                        inconsistentTemplateEquipQty
                    ).join(', ')}`
                )
                ;(', ')
                setIsCreatingItems(false)
                return
            }

            const deduplicatedComponents =
                deduplicateComponents(componentsToCreate)

            const componentsCreated = await createComponentsOnFileUpload(
                deduplicatedComponents
            )

            setCreationStepMessage('Creating Templates...')

            const { successCount, templatesAlreadyExisting, failureCount } =
                await createTemplatesOnFileUpload(templatesMap)

            //Check if there are any valid EquipQty in the Excel file
            const hasValidEquipQty = Array.from(templatesMap.values()).some(
                (components) =>
                    components.some(
                        (component) =>
                            component.equipQty && component.equipQty > 0
                    )
            )

            let equipmentCreated = { uniqueEquipmentCount: 0 }

            if (hasValidEquipQty) {
                setCreationStepMessage('Creating Equipment...')

                equipmentCreated = await createEquipmentOnFileUpload(
                    templatesMap
                )
            }

            displayToastMessagesOnFileUpload(
                jsonData.length,
                successCount,
                componentsCreated.results.success.length,
                equipmentCreated.uniqueEquipmentCount,
                templatesAlreadyExisting,
                failureCount
            )

            if (componentsCreated.results.success.length > 0) {
                setComponentsInProject((prevComponents) => [
                    ...prevComponents,
                    ...componentsCreated.results.success,
                ])
            }
        } catch (error) {
            console.error('Error during file processing:', error)
            toast.error('Error processing file.')
        } finally {
            setIsCreatingItems(false)
            setIsFileUploadOpen(false)
            setCreationStepMessage('')
        }
    }

    //CREATE new Components
    const createComponentsOnFileUpload = async (componentsToCreate) => {
        const processedData = componentsToCreate.map((componentData) => {
            const defaultComponentData = {
                Code: 'acc',
                Name: componentData.Component,
                LabUplift: 0,
                MatNorm: 0,
                SubConCost: 0,
                SubConNorm: 0,
                PlantCost: 0,
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
                /*                 onComponentsBulkCreate(responseBody.success)
                 */ return { success: true, results: responseBody }
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

    //CREATE new Templates
    const createTemplatesOnFileUpload = async (templatesMap) => {
        // Prepare the data for bulk creation
        const templatesData = Array.from(templatesMap.entries()).map(
            ([tempName, components]) => ({
                Name: tempName,
                components: components.map((component) => ({
                    compName: component.component,
                    compLabNorm: component.labNorm,
                    inOrder: component.inOrder,
                })),
                JobNo: jobNo,
            })
        )

        try {
            const response = await fetch(
                generateProjectTemplatesBulkURL(jobNo),
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(templatesData),
                }
            )

            const responseBody = await response.json()
            if (!response.ok) {
                throw new Error(responseBody.message)
            }

            /* if (responseBody.success.length > 0)
                                onTemplatesBulkCreate(responseBody.success)  */
            const { success, alreadyExists, failures } = responseBody
            return {
                successCount: success.length,
                templatesAlreadyExisting: alreadyExists.length,
                failureCount: failures.length,
            }
        } catch (error) {
            console.error('Error creating templates in bulk:', error)
            toast.error(`Error: ${error.message}`)
            return {
                successCount: 0,
                templatesAlreadyExisting: 0,
                failureCount: 0,
            }
        }
    }

    //CREATE new Equipment based on the EquipQty for each Template in the Excel file
    const createEquipmentOnFileUpload = async (templatesMap) => {
        const equipmentData = []

        for (const [tempName, componentsArray] of templatesMap.entries()) {
            const equipQty = isNaN(componentsArray[0].equipQty)
                ? 0
                : componentsArray[0].equipQty

            for (let i = 1; i <= equipQty; i++) {
                const equipRef =
                    equipQty !== 1
                        ? `${tempName}-${String(i).padStart(2, '0')}`
                        : tempName
                const existingEquipment = equipmentList.find(
                    (equip) => equip.Ref === equipRef
                )

                if (!existingEquipment) {
                    equipmentData.push({
                        JobNo: jobNo,
                        Ref: equipRef,
                        Description: 't.b.a',
                        Name: tempName,
                        Components: componentsArray.map((c) => c.component),
                        ProgID: 't.b.a',
                        TendID: 't.b.a',
                    })
                }
            }
        }

        // Sending bulk request
        try {
            const response = await fetch(
                generateProjectEquipmentBulkURL(jobNo),
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(equipmentData),
                }
            )

            const responseBody = await response.json()
            if (!response.ok) {
                throw new Error(responseBody.message)
            }

            /*             if (responseBody.success.length > 0)
                onEquipmentBulkCreate(responseBody.success) */
            const { success, failures, uniqueEquipmentCount } = responseBody
            return {
                successCount: success.length,
                failureCount: failures.length,
                uniqueEquipmentCount,
            }
        } catch (error) {
            console.error('Error creating Equipment in bulk:', error)
            toast.error(`Error: ${error.message}`)
            return {
                successCount: 0,
                failureCount: 0,
            }
        }
    }

    const displayToastMessagesOnFileUpload = (
        numberOfLines,
        successCount,
        componentsCreated,
        equipmentCreated,
        templatesAlreadyExisting,
        failureCount
    ) => {
        toast.info(`Processed ${numberOfLines} lines.`)
        if (componentsCreated > 0)
            toast.success(`Created ${componentsCreated} Component(s).`)
        if (successCount > 0)
            toast.success(`Created ${successCount} Template(s).`)
        if (equipmentCreated > 0)
            toast.success(`Created ${equipmentCreated} Equipment.`)
        if (templatesAlreadyExisting > 0) {
            toast.warning(
                `${templatesAlreadyExisting} Template(s) already exist.`
            )
        }
        if (failureCount > 0 && failureCount !== numberOfLines) {
            toast.error(
                `${failureCount} lines failed, please check your Excel file.`
            )
        }
    }

    // 2. Helper Functions
    const validators = {
        Name: (value) =>
            templatesNamePattern.test(value)
                ? ''
                : 'should be between 3 and 80 characters long.',
    }

    const fieldClasses = {
        Name: getClassForField('Name', fieldErrors, fieldValues),
    }

    // 3. Event handlers
    const handleInputChange = (e) => {
        const { id, value } = e.target
        setFieldValues((prevValues) => ({ ...prevValues, [id]: value }))

        const errorMessage = validateField(validators, id, value)
        setFieldErrors((prevErrors) => ({ ...prevErrors, [id]: errorMessage }))
    }

    //Updates selectedComponents on click in "Selected Components"
    const handleComponentDeselect = (component) => {
        setComponentAnimations((prevAnimations) => ({
            ...prevAnimations,
            [component.uid]: 'exiting',
        }))

        setTimeout(() => {
            setSelectedComponents((prevComponents) =>
                prevComponents.filter((comp) => comp.uid !== component.uid)
            )
            setComponentAnimations((prevAnimations) => {
                const updatedAnimations = { ...prevAnimations }
                delete updatedAnimations[component.uid]
                return updatedAnimations
            })
        }, 300)
    }

    //Clears selectedComponents
    const handleClearAll = () => {
        setComponentAnimations({})
        setSelectedComponents([])
    }

    //FORM submit (here, CREATE only)
    const handleFormSubmit = async (e) => {
        e.preventDefault()

        const { isValid, fieldValues: validatedFieldValues } =
            validateFormFields(
                e,
                fieldNames,
                validators,
                setIsValid,
                setFieldErrors
            )

        if (!isValid) return

        //Data of the new Component
        const newTemplateData = { jobNo, ...validatedFieldValues }

        await handleCreateTemplate(newTemplateData)
    }

    //CREATE Template logic
    const handleCreateTemplate = async (templateData, fileUpload = false) => {
        if (!fileUpload && selectedComponents.length === 0) {
            toast.info(
                'Please select at least one Component to create a Template.'
            )
            return
        }

        let componentsData

        if (fileUpload) {
            componentsData = templateData.components.map((comp) => ({
                compName: comp.component,
                compLabNorm: comp.labNorm,
            }))
        } else {
            componentsData = selectedComponents.map((comp) => ({
                compName: comp.Name,
                compLabNorm: comp.LabNorm,
            }))
        }

        const requestData = {
            ...templateData,
            components: componentsData,
        }

        try {
            const response = await fetch(generateProjectTemplatesURL(jobNo), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
            })

            if (response.status === 409) {
                const responseBody = await response.json()
                console.error('Conflict Error:', responseBody.message)
                if (!fileUpload) toast.warning('This Template already exists.')
                return {
                    success: false,
                    error: responseBody.message,
                    statusCode: response.status,
                }
            } else if (!response.ok) {
                const responseBody = await response.json()
                console.error(
                    'Error:',
                    'An error occurred while creating new Template.'
                )
                if (!fileUpload)
                    toast.error(
                        'An error occurred while creating new Template.'
                    )
                return { success: false, error: responseBody.message }
            } else if (response.ok) {
                const newTemplate = await response.json()
                if (!fileUpload) toast.success('Template successfully created!')
                /*                 onTemplateCreate(newTemplate)
                 */ return { success: true, template: newTemplate }
            }
        } catch (error) {
            console.error('Error:', error)
            if (!fileUpload) toast.error(`Error: ${error.message}`)
            return { success: false, error: error.message }
        }
    }

    //DUPLICATE Template logic
    const handleDuplicateTemplate = async (templateData) => {
        try {
            //Fetch the components of the template to be duplicated
            const componentsResponse = await fetch(
                generateTemplateComponentsURL(jobNo, templateData.Name)
            )
            if (!componentsResponse.ok) {
                throw new Error('Failed to fetch components for the template')
            }
            const componentsInTemplate = await componentsResponse.json()

            //Extract component names from the response
            const componentsData = componentsInTemplate.map((comp) => ({
                compName: comp.Component,
                compLabNorm: comp.LabNorm,
            }))

            //Create a new template name by appending 'x' to the existing name
            const newTemplateName = `${templateData.Name}x`
            const newTemplateData = {
                jobNo,
                WholeEstimate: false,
                Name: newTemplateName,
                components: componentsData,
            }

            try {
                const response = await fetch(
                    generateProjectTemplatesURL(jobNo),
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newTemplateData),
                    }
                )

                if (response.status === 409) {
                    const responseBody = await response.json()
                    console.error('Conflict Error:', responseBody.message)
                    toast.warning('This Template already exists.')
                } else if (!response.ok) {
                    console.error(
                        'Error:',
                        'An error occurred while duplicating the Template.'
                    )
                    toast.error(
                        'An error occurred while duplicating the Template.'
                    )
                } else if (response.ok) {
                    const newTemplate = await response.json()
                    toast.success(
                        `Template successfully duplicated! (${newTemplate.Name})`
                    )
                    /*                     onTemplateCreate(newTemplate)
                     */
                }
            } catch (error) {
                console.error('Error:', error)
                toast.error(`Error: ${error.message}`)
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error(`Error: ${error.message}`)
        }
    }

    //EDIT Template logic
    const openEditTemplateDialogBox = async (rowData) => {
        const selectedTemplateComponents = await getTemplateComponents(
            jobNo,
            rowData.Name
        )
        setComponentsInTemplate(selectedTemplateComponents)
        setIsEditTemplateDialogBoxOpen(true)
    }

    //Displays the list of Components present in the selected Template
    const getTemplateComponents = async (jobNo, tempName) => {
        try {
            const response = await fetch(
                generateTemplateComponentsURL(jobNo, tempName)
            )

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`)
            }

            const componentsInTemplate = await response.json()

            return componentsInTemplate
        } catch (error) {
            console.error('Failed to fetch template components:', error)
            return
        }
    }

    //Returns Components present in the selected Template (ordered by templates.inOrder column)
    const filteredComponents = componentsInTemplate.map((templateComponent) => {
        //Find the corresponding Component in the template
        const component = componentsInProject.find(
            (c) => c.ID === templateComponent.Component_ID
        )

        return {
            ...templateComponent,
            ...component,
        }
    })

    const handleContextMenuOptionClick = async (option, rowData) => {
        switch (option.action) {
            case 'editTemplate':
                openEditTemplateDialogBox(rowData)
                break
            case 'duplicateTemplate':
                handleDuplicateTemplate(rowData)
                break
        }

        setContextMenuState({ ...contextMenuState, visible: false })
    }

    //Moves a Component up in the list
    const moveComponentUp = (index) => {
        if (index === 0) return
        setSelectedComponents((prevComponents) => {
            const componentsInProject = [...prevComponents]
            ;[componentsInProject[index - 1], componentsInProject[index]] = [
                componentsInProject[index],
                componentsInProject[index - 1],
            ]
            return componentsInProject
        })
    }

    //Moves a Component down in the list
    const moveComponentDown = (index) => {
        if (index === selectedComponents.length - 1) return
        setSelectedComponents((prevComponents) => {
            const componentsInProject = [...prevComponents]
            ;[componentsInProject[index], componentsInProject[index + 1]] = [
                componentsInProject[index + 1],
                componentsInProject[index],
            ]
            return componentsInProject
        })
    }

    // 4. useEffects
    useEffect(() => {
        if (jobNo && isLoadingComponents) {
            componentsInProjectTableGridApi?.showLoadingOverlay()
        } else if (componentsInProjectTableGridApi) {
            componentsInProjectTableGridApi?.hideOverlay()
        }
    }, [
        jobNo,
        componentsInProject,
        componentsInProjectTableGridApi,
        isLoadingComponents,
    ])

    useEffect(() => {
        const fetchComponentsInProject = async () => {
            try {
                setIsLoadingComponents(true)
                const response = await fetch(
                    generateProjectNonCBSComponentsWithLabnormsURL(jobNo)
                )
                const data = await response.json()
                setComponentsInProject(data)
            } catch (error) {
                console.error('Failed to fetch components:', error)
                toast.error('Failed to load components.')
            } finally {
                setIsLoadingComponents(false)
            }
        }

        if (jobNo) {
            fetchComponentsInProject()
            fetchTemplatesList(jobNo)
        }
    }, [jobNo, fetchTemplatesList])

    /*     useEffect(() => {
        const fetchComponentsInProject = async () => {
            try {
                setIsLoadingComponents(true)
                const response = await fetch(
                    generateProjectNonCBSComponentsWithLabnormsURL(jobNo)
                )
                const data = await response.json()
                setComponentsInProject(data)
            } catch (error) {
                console.error('Failed to fetch components:', error)
                toast.error('Failed to load components.')
            } finally {
                setIsLoadingComponents(false)
            }
        }
    }, [jobNo]) */

    useEffect(() => {
        if (componentsInProjectTableGridApi && componentsInProject.length > 0) {
            componentsInProjectTableGridApi.updateGridOptions({
                rowData: componentsInProject,
            })
        }
    }, [componentsInProject, componentsInProjectTableGridApi])

    useEffect(() => {
        if (isLoading) {
            templatesTableGridApi?.showLoadingOverlay()
        } else if (templatesTableGridApi) {
            templatesTableGridApi?.hideOverlay()
        }
    }, [templatesTableGridApi, isLoading])

    useEffect(() => {
        if (selectedTemplate) {
            getTemplateComponents(jobNo, selectedTemplate.Name).then((data) =>
                setComponentsInTemplate(data || [])
            )
        }
    }, [jobNo, selectedTemplate, templateUpdated])

    useEffect(() => {
        setComponentAnimations((prevAnimations) => {
            const newAnimations = { ...prevAnimations }

            selectedComponents.forEach((component) => {
                if (!newAnimations[component.uid]) {
                    newAnimations[component.uid] = 'entering'
                }
            })

            Object.keys(newAnimations).forEach((key) => {
                if (newAnimations[key] === 'entering') {
                    newAnimations[key] = 'entered'
                }
            })

            return newAnimations
        })
    }, [selectedComponents])

    useEffect(() => {
        if (selectedComponentsWrapperRef.current && componentAdded) {
            const element = selectedComponentsWrapperRef.current
            element.scrollTop = element.scrollHeight
            setComponentAdded(false)
        }
    }, [componentAdded])

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
            <TemplatesViewContainer>
                <ShowTemplatesContainer>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            flex: '1',
                        }}
                    >
                        <span className="grey-label left">Templates List</span>
                        <TemplatesWrapper>
                            <div
                                style={{
                                    height: '100%',
                                    width: '100%',
                                }}
                            >
                                <StyledAGGrid
                                    className="ag-theme-quartz purple-table"
                                    gridOptions={templatesTableGridOptions}
                                    rowData={templatesList}
                                />
                            </div>
                        </TemplatesWrapper>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            flex: '1',
                        }}
                    >
                        <span className="grey-label left">
                            Components in selected Template
                        </span>
                        <ComponentsInTemplateWrapper>
                            <div
                                style={{
                                    height: '100%',
                                    width: '100%',
                                }}
                            >
                                <StyledAGGrid
                                    className="ag-theme-quartz basic"
                                    gridOptions={
                                        componentsInSelectedTemplateTableGridOptions
                                    }
                                    rowData={filteredComponents}
                                />
                            </div>
                            {contextMenuState.visible && (
                                <ContextMenu
                                    position={{
                                        top: contextMenuState.position.y,
                                        left: contextMenuState.position.x,
                                    }}
                                    data={contextMenuState.rowData}
                                    options={contextMenuOptions.templatesTable}
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
                        </ComponentsInTemplateWrapper>
                    </div>
                </ShowTemplatesContainer>
                <CreateTemplateForm onSubmit={handleFormSubmit}>
                    <div className="purple-label">Create a new Template</div>
                    <TemplatesAndComponentsContainer>
                        <ComponentsWrapper>
                            <span className="grey-label left">
                                Components List
                            </span>
                            <div
                                style={{
                                    height: '100%',
                                    width: '100%',
                                }}
                            >
                                <StyledAGGrid
                                    className="ag-theme-quartz purple-table"
                                    gridOptions={
                                        componentsInProjectTableGridOptions
                                    }
                                    rowData={componentsInProject}
                                />
                            </div>
                        </ComponentsWrapper>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="64"
                            height="64"
                            style={{
                                alignSelf: 'center',
                                paddingLeft: '5px',
                            }}
                        >
                            <path
                                d="M13.1714 12.0007L8.22168 7.05093L9.63589 5.63672L15.9999 12.0007L9.63589 18.3646L8.22168 16.9504L13.1714 12.0007Z"
                                fill="rgba(169,169,169,1)"
                            ></path>
                        </svg>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                flex: '1',
                            }}
                        >
                            <span className="grey-label left">
                                Selected Components (and their Norm):
                            </span>
                            <SelectedComponentsWrapper
                                ref={selectedComponentsWrapperRef}
                            >
                                {selectedComponents.length === 0 ? (
                                    <SelectComponentMessage>
                                        Select Components to compose a Template
                                        <br />
                                        OR
                                        <br />
                                        <div
                                            className="file-label"
                                            onClick={toggleFileUpload}
                                            style={{
                                                paddingTop: '5px',
                                            }}
                                        >
                                            <FileUploadButton
                                                onChange={handleFileUpload}
                                            />
                                        </div>
                                    </SelectComponentMessage>
                                ) : (
                                    <>
                                        {selectedComponents.map(
                                            (component, index) => {
                                                const animationstate =
                                                    componentAnimations[
                                                        component.uid
                                                    ]

                                                return (
                                                    <SelectedComponentRow
                                                        key={component.uid}
                                                        $animationstate={
                                                            animationstate
                                                        }
                                                    >
                                                        <span
                                                            onClick={() =>
                                                                handleComponentDeselect(
                                                                    component
                                                                )
                                                            }
                                                        >
                                                            {component.Name}{' '}
                                                            <span
                                                                style={{
                                                                    fontStyle:
                                                                        'italic',
                                                                    color: 'grey',
                                                                }}
                                                            >
                                                                (
                                                                {parseFloat(
                                                                    component.LabNorm.toFixed(
                                                                        3
                                                                    )
                                                                )}
                                                                )
                                                            </span>
                                                        </span>
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                flexDirection:
                                                                    'row',
                                                            }}
                                                        >
                                                            <img
                                                                src={ArrowUp}
                                                                alt="move up"
                                                                onClick={() =>
                                                                    moveComponentUp(
                                                                        index
                                                                    )
                                                                }
                                                            />

                                                            <img
                                                                src={ArrowDown}
                                                                alt="move down"
                                                                onClick={() =>
                                                                    moveComponentDown(
                                                                        index
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </SelectedComponentRow>
                                                )
                                            }
                                        )}
                                    </>
                                )}
                            </SelectedComponentsWrapper>
                            <ClearAllButton
                                type="button"
                                onClick={handleClearAll}
                            >
                                Clear All
                            </ClearAllButton>
                        </div>
                    </TemplatesAndComponentsContainer>
                    <FieldsWrapper>
                        <TemplatesFieldsContainer>
                            <TemplatesFormField className="tempNameField">
                                <LabelInputContainer>
                                    <label htmlFor="Name">Template Name</label>
                                    <input
                                        id="Name"
                                        value={fieldValues.Name}
                                        onChange={handleInputChange}
                                        className={fieldClasses.Name}
                                        type="text"
                                        placeholder="Min. 3 characters"
                                        maxLength={80}
                                    />
                                </LabelInputContainer>
                                {fieldErrors['Name'] && (
                                    <ErrorMessage>
                                        {fieldErrors['Name']}
                                    </ErrorMessage>
                                )}
                            </TemplatesFormField>
                        </TemplatesFieldsContainer>
                        <ButtonsContainer>
                            <FormButton type="submit" variant="submit">
                                Create
                            </FormButton>
                            <FormButton type="reset" variant="cancel">
                                Cancel
                            </FormButton>
                        </ButtonsContainer>
                    </FieldsWrapper>
                </CreateTemplateForm>

                {/*                 {/* Displays EditTemplateDialogBox when "Edit" context menu option is clicked in TemplatesTable 
                {isEditTemplateDialogBoxOpen && (
                    <EditTemplateDialogBox
                        jobNo={jobNo}
                        componentsInTemplate={componentsInTemplate}
                        componentsInProject={componentsInProject}
                        handleComponentSelect={handleComponentSelect}
                        handleComponentDeselect={handleComponentDeselect}
                        onTemplateUpdate={onTemplateUpdate}
                        onTemplateUpdateRefreshComponents={signalTemplateUpdate}
                        onClose={() => setIsEditTemplateDialogBoxOpen(false)}
                    />
                )} */}
            </TemplatesViewContainer>
        </>
    )
}

export default TemplatesView
