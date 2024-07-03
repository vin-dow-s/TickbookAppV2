//Modules
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'

//Hooks
import useStore from '../hooks/useStore'

//Utils
import { onCellContextMenu } from '../utils/gridUtils'
import {
    validateField,
    validateFormFields,
} from '../utils/validationFormFields'

//Helpers
import {
    displayToastMessagesOnFileUpload,
    fetchComponentsInProject,
    fieldClasses,
    templateValidators,
} from '../helpers/templateHelpers'

//Styles and constants
import { Overlay } from '../styles/dialog-boxes'
import { colors } from '../styles/global-styles'
import { StyledAGGrid } from '../styles/ag-grid'
import {
    columnsComponentsInProject,
    columnsComponentsInSelectedTemplate,
    columnsTemplates,
} from '../constants/ag-grid-columns'
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
import EditTemplateDialogBox from '../components/DialogBoxes/EditTemplateDialogBox'

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

const TemplatesWrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
`

const ComponentsInTemplateWrapper = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 160px;
`

const CreateTemplateForm = styled(FormBase)`
    flex: 1.5;
    background-color: white;
    color: black;
    border-radius: 10px;
    padding: 10px;
`

const TemplatesAndComponentsContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: row;
    flex: 0.7;
    width: 100%;
    gap: 25px;
    margin-bottom: 25px;

    label {
        width: 300px;
        top: 45px;
        font-size: small;
        font-style: italic;
        color: ${colors.purpleBgenDarker};
    }
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

const FieldsWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin-bottom: 25px;
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

    .file-content {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-top: 10px;
    }

    .file-loaded-indicator {
        margin-top: 10px;
        text-align: center;
        font-style: italic;
        font-size: smaller;
        color: rgba(0, 0, 0, 0.5);
    }
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

    @media screen and (max-width: 1017px), screen and (max-height: 700px) {
        font-size: smaller;
    }
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

const TemplatesView = () => {
    //1. State declarations
    const {
        jobNo,
        templatesList,
        isLoading,
        fetchTemplateComponents,
        onTemplateCreate,
        onTemplateDuplicate,
        handleTemplateFileUpload,
    } = useStore((state) => ({
        jobNo: state.jobNo,
        templatesList: state.templatesList,
        isLoading: state.isLoading,
        fetchTemplateComponents: state.fetchTemplateComponents,
        onTemplateCreate: state.onTemplateCreate,
        onTemplateDuplicate: state.onTemplateDuplicate,
        handleTemplateFileUpload: state.handleTemplateFileUpload,
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
    const fieldNames = ['Name']
    const [, setIsValid] = useState({
        Name: null,
        Component: null,
    })
    const [fieldErrors, setFieldErrors] = useState({
        Name: '',
        Component: '',
    })
    const [fieldValues, setFieldValues] = useState({
        Name: '',
        WholeEstimate: false,
    })
    const [nonCbsComponentsInProject, setNonCbsComponentsInProject] = useState(
        []
    )
    const [isLoadingComponents, setIsLoadingComponents] = useState(true)
    const [selectedComponents, setSelectedComponents] = useState([])
    const [selectedTemplate, setSelectedTemplate] = useState(null)
    const [componentsInTemplate, setComponentsInTemplate] = useState([])
    const [componentAnimations, setComponentAnimations] = useState({})
    const [componentAdded, setComponentAdded] = useState(false)
    const selectedComponentsWrapperRef = useRef(null)
    const [isEditTemplateDialogBoxOpen, setIsEditTemplateDialogBoxOpen] =
        useState(false)
    const [isCreatingItems, setIsCreatingItems] = useState(false)
    const [creationStepMessage, setCreationStepMessage] = useState('')

    const fieldClassesComputed = fieldClasses(fieldErrors, fieldValues)

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
        fetchTemplateComponents(selectedTemplateData.Name)
    }

    const templatesTableGridOptions = {
        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true,
        },
        columnDefs: columnsTemplates,
        rowSelection: 'single',
        getRowId: (params) => params.data.Name,
        overlayLoadingTemplate: overlayLoadingTemplatePurple,
        onGridReady: (params) => {
            setTemplatesTableGridApi(params.api)
            params.api.updateGridOptions({ rowData: templatesList })
        },
        onRowClicked: handleTemplateSelect,
        onCellContextMenu: (params) => {
            onCellContextMenu(params, setContextMenuState)
        },
        suppressScrollOnNewData: true,
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
            params.api.updateGridOptions({ rowData: nonCbsComponentsInProject })
        },
        onRowClicked: handleComponentSelect,
        suppressScrollOnNewData: true,
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

    const updateTemplatesTable = async (updatedTemplate) => {
        if (templatesTableGridApi) {
            const updatedTemplates = templatesList.map((template) =>
                template.Name === updatedTemplate.Name
                    ? updatedTemplate
                    : template
            )
            templatesTableGridApi.applyTransactionAsync({
                update: updatedTemplates,
            })

            if (
                selectedTemplate &&
                updatedTemplate.Name === selectedTemplate.Name
            ) {
                setSelectedTemplate(updatedTemplate)
                await refreshComponentsInSelectedTemplate(updatedTemplate.Name)
            }
        }
    }

    const refreshComponentsInSelectedTemplate = async (templateName) => {
        const updatedComponents = await fetchTemplateComponents(
            jobNo,
            templateName
        )
        setComponentsInTemplate(updatedComponents || [])
    }

    //3. Event handlers
    const handleInputChange = (e) => {
        const { id, value } = e.target
        // Update field values
        setFieldValues((prevValues) => ({ ...prevValues, [id]: value }))

        // Dynamically check the input against the regex pattern and set error message
        const errorMessage = validateField(templateValidators, id, value)
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
                templateValidators,
                setIsValid,
                setFieldErrors
            )

        if (!isValid) return

        //Data of the new Component
        const newTemplateData = {
            jobNo,
            ...validatedFieldValues,
            components: selectedComponents.map((component) => ({
                compName: component.Name,
                compLabNorm: component.LabNorm,
            })),
        }

        const result = await onTemplateCreate(jobNo, newTemplateData)
        if (result.success) {
            toast.success('Template successfully created.')
        } else if (result.statusCode === 409) {
            toast.warning('This Template already exists.')
        } else {
            toast.error('An error occurred while creating new Template.')
        }
    }

    //CREATE Components + Templates + Equipment on file upload
    const handleFileUpload = async (event) => {
        setIsCreatingItems(true)

        const result = await handleTemplateFileUpload(
            jobNo,
            event,
            setCreationStepMessage
        )

        if (result.success) {
            displayToastMessagesOnFileUpload(
                result.jsonDataLength,
                result.successCount,
                result.componentsCreatedCount,
                result.equipmentCreatedCount,
                result.templatesAlreadyExisting,
                result.failureCount
            )

            if (componentsInProjectTableGridApi) {
                const newComponents = result.componentsCreated
                componentsInProjectTableGridApi.applyTransactionAsync({
                    add: newComponents,
                })
            }
        } else {
            result.errors.forEach((error) => toast.error(error))
        }

        setIsCreatingItems(false)
    }

    //DUPLICATE Template logic
    const handleDuplicateTemplate = async (templateData) => {
        const result = await onTemplateDuplicate(jobNo, templateData)
        if (result.success) {
            toast.success(
                `Template successfully duplicated! (${result.template.Name})`
            )
        } else {
            toast.error(`${result.error}`)
        }
    }

    const openEditTemplateDialogBox = async (rowData) => {
        const selectedTemplateComponents = await fetchTemplateComponents(
            jobNo,
            rowData.Name
        )
        setSelectedTemplate(rowData)
        setComponentsInTemplate(selectedTemplateComponents)
        setIsEditTemplateDialogBoxOpen(true)
    }

    //Returns Components present in the selected Template (ordered by templates.inOrder column)
    const filteredComponents = componentsInTemplate.map((templateComponent) => {
        //Find the corresponding Component in the template
        const component = nonCbsComponentsInProject.find(
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

    const handleCancelClick = () => {
        setIsValid({
            Name: null,
            Component: null,
        })
        setFieldValues({
            Name: '',
            WholeEstimate: false,
        })
        setFieldErrors({})
        setSelectedComponents([])
    }

    //Moves a Component up in the list
    const moveComponentUp = (index) => {
        if (index === 0) return
        setSelectedComponents((prevComponents) => {
            const nonCbsComponentsInProject = [...prevComponents]
            ;[
                nonCbsComponentsInProject[index - 1],
                nonCbsComponentsInProject[index],
            ] = [
                nonCbsComponentsInProject[index],
                nonCbsComponentsInProject[index - 1],
            ]
            return nonCbsComponentsInProject
        })
    }

    //Moves a Component down in the list
    const moveComponentDown = (index) => {
        if (index === selectedComponents.length - 1) return
        setSelectedComponents((prevComponents) => {
            const nonCbsComponentsInProject = [...prevComponents]
            ;[
                nonCbsComponentsInProject[index],
                nonCbsComponentsInProject[index + 1],
            ] = [
                nonCbsComponentsInProject[index + 1],
                nonCbsComponentsInProject[index],
            ]
            return nonCbsComponentsInProject
        })
    }

    //4. useEffects
    useEffect(() => {
        if (jobNo && isLoadingComponents) {
            componentsInProjectTableGridApi?.showLoadingOverlay()
        } else if (componentsInProjectTableGridApi) {
            componentsInProjectTableGridApi?.hideOverlay()
        }
    }, [jobNo, isLoadingComponents, componentsInProjectTableGridApi])

    useEffect(() => {
        if (jobNo) {
            fetchComponentsInProject(
                jobNo,
                setNonCbsComponentsInProject,
                setIsLoadingComponents
            )
        }
    }, [jobNo])

    useEffect(() => {
        if (
            componentsInProjectTableGridApi &&
            nonCbsComponentsInProject.length > 0
        ) {
            componentsInProjectTableGridApi.updateGridOptions({
                rowData: nonCbsComponentsInProject,
            })
        }
    }, [nonCbsComponentsInProject, componentsInProjectTableGridApi])

    useEffect(() => {
        if (isLoading) {
            templatesTableGridApi?.showLoadingOverlay()
        } else if (templatesTableGridApi) {
            templatesTableGridApi?.hideOverlay()
        }
    }, [templatesTableGridApi, isLoading])

    useEffect(() => {
        if (selectedTemplate) {
            fetchTemplateComponents(jobNo, selectedTemplate.Name).then((data) =>
                setComponentsInTemplate(data || [])
            )
        }
    }, [jobNo, selectedTemplate, fetchTemplateComponents])

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
                                    rowData={nonCbsComponentsInProject}
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
                                        <div style={{ marginBottom: '10px' }}>
                                            Select Components to compose a
                                            Template
                                        </div>
                                        <br />
                                        OR
                                        <br />
                                        <div className="file-content">
                                            <FileUploadButton
                                                onChange={handleFileUpload}
                                            />
                                            <span className="file-loaded-indicator">
                                                File should be
                                                ComponentsTemplatesEquipment_Template.xlsx
                                            </span>
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
                            <TemplatesFormField className="nameField">
                                <LabelInputContainer>
                                    <label htmlFor="Name">Template Name</label>
                                    <input
                                        id="Name"
                                        value={fieldValues.Name}
                                        onChange={handleInputChange}
                                        className={fieldClassesComputed.Name}
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
                            <FormButton
                                type="reset"
                                variant="cancel"
                                onClick={handleCancelClick}
                            >
                                Cancel
                            </FormButton>
                        </ButtonsContainer>
                    </FieldsWrapper>
                </CreateTemplateForm>

                {/* Displays EditTemplateDialogBox when "Edit" context menu option is clicked in TemplatesTable */}
                {isEditTemplateDialogBoxOpen && (
                    <EditTemplateDialogBox
                        jobNo={jobNo}
                        componentsInTemplate={componentsInTemplate}
                        nonCbsComponentsInProject={nonCbsComponentsInProject}
                        handleComponentSelect={handleComponentSelect}
                        handleComponentDeselect={handleComponentDeselect}
                        updateTemplatesTable={updateTemplatesTable}
                        onClose={() => setIsEditTemplateDialogBoxOpen(false)}
                    />
                )}
            </TemplatesViewContainer>
        </>
    )
}

export default TemplatesView
