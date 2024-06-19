//Modules
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'

//Hooks
import useStore from '../hooks/useStore'

//Utils
import { generateTemplateComponentsURL } from '../utils/apiConfig'
import {
    validateField,
    validateFormFields,
} from '../utils/validationFormFields'

//Helpers
import { fetchComponentsInProject } from '../helpers/templateHelpers'

//Styles and constants
import { columnsComponentsInSelectedTemplate } from '../constants/dialog-box-tables-columns'
import { Overlay } from '../styles/dialog-boxes'
import { colors } from '../styles/global-styles'
import { StyledAGGrid } from '../styles/ag-grid'

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
import {
    displayToastMessagesOnFileUpload,
    equipmentValidators,
    fieldClasses,
} from '../helpers/equipmentHelpers'

//Styled Equipment declarations
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

const EquipmentViewContainer = styled.div`
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

const ComponentsInTemplateContainer = styled.div`
    height: calc(100% - 500px);
    position: relative;
    flex: 1.5;
    background-color: white;
    color: black;
    border-radius: 10px;
    padding: 10px;
`

const CreateEquipmentAndFileUploadContainer = styled.div`
    display: flex;
    gap: 10px;
    background-color: #f7f6f3;
    color: black;
    border-radius: 10px;
    flex-wrap: wrap;

    @media screen and (max-width: 1017px) {
        flex-direction: column;
        > div {
            flex: 1;
        }
    }
`

const CreateEquipmentContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 0.8;
    padding: 10px;
    background-color: white;
    color: black;
    border-radius: 10px;

    @media screen and (max-width: 800px) {
        flex: 1;
        width: 100%;
    }
`

const FieldsWrapper = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 10px;

    @media screen and (max-width: 800px) {
        flex-direction: column;
    }
`

const EquipmentFieldsContainer = styled(FieldsContainer)`
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: 10px;

    .disabled {
        color: ${colors.tablesBorders};
    }
`

const FirstRowContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    width: 100%;
`

const SecondRowContainer = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-top: 25px;
`

const ThirdRowContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-top: 25px;
`

const CreateEquipmentFormField = styled(FormField)`
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    label {
        margin-bottom: 5px;
    }

    input {
        width: 100%;
    }

    &.refField {
        flex: 0.4;
    }

    &.descriptionField {
        flex: 0.6;
    }

    &.sectionField {
        flex: 0.4;
    }

    &.areaField {
        flex: 0.4;
    }

    .templateHours {
        position: absolute;
        width: 300px;
        top: 45px;
        font-size: small;
        color: ${colors.purpleBgenDarker};
    }

    &.currentRevisionField {
        width: 200px;
    }

    .disabled-field {
        color: ${colors.tablesBorders};
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

//Main component of the file
const EquipmentView = () => {
    const {
        jobNo,
        templatesList,
        fetchTemplatesList,
        fetchEquipmentList,
        onEquipmentCreate,
        handleEquipmentFileUpload,
    } = useStore((state) => ({
        jobNo: state.jobNo,
        templatesList: state.templatesList,
        isLoading: state.isLoading,
        fetchTemplatesList: state.fetchTemplatesList,
        fetchEquipmentList: state.fetchEquipmentList,
        onEquipmentCreate: state.onEquipmentCreate,
        handleEquipmentFileUpload: state.handleEquipmentFileUpload,
    }))
    // 1. State declarations
    const [
        componentsInSelectedTemplateTableGridApi,
        setComponentsInSelectedTemplateTableGridApi,
    ] = useState(null)

    const [, setIsValid] = useState({
        Ref: null,
        Description: null,
        Section: null,
        Area: null,
        Template: true,
        CurrentRevision: null,
    })
    const [fieldErrors, setFieldErrors] = useState({
        Ref: '',
        Description: '',
        Section: '',
        Area: '',
        Template: '',
        CurrentRevision: '',
    })
    const [fieldValues, setFieldValues] = useState({
        Ref: '',
        Description: '',
        Section: '',
        Area: '',
        Template: '',
        CurrentRevision: '',
    })
    const fieldNames = [
        'Ref',
        'Description',
        'Section',
        'Area',
        'Template',
        'CurrentRevision',
    ]
    const [selectedTemplate, setSelectedTemplate] = useState(() =>
        templatesList.length > 0 ? templatesList[0] : null
    )
    const [isLoadingComponents, setIsLoadingComponents] = useState(true)
    const [nonCbsComponentsInProject, setNonCbsComponentsInProject] = useState(
        []
    )
    const [componentsInTemplate, setComponentsInTemplate] = useState([])
    const [isCreatingItems, setIsCreatingItems] = useState(false)
    const [creationStepMessage, setCreationStepMessage] = useState('')

    const fieldClassesComputed = fieldClasses(fieldErrors, fieldValues)

    //Returns Components present in the selected Template (ordered by templates.inOrder column)
    const filteredComponents = useMemo(() => {
        return componentsInTemplate.map((templateComponent) => {
            const component = nonCbsComponentsInProject.find(
                (c) => c.ID === templateComponent.Component_ID
            )
            return {
                ...templateComponent,
                ...component,
            }
        })
    }, [componentsInTemplate, nonCbsComponentsInProject])

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
    }

    //Updates components in selected template on template change
    useEffect(() => {
        if (selectedTemplate) {
            const { Name } = selectedTemplate
            getTemplateComponents(jobNo, Name).then((data) =>
                setComponentsInTemplate(data || [])
            )
        }
    }, [jobNo, selectedTemplate])

    useEffect(() => {
        if (jobNo) {
            fetchComponentsInProject(
                jobNo,
                setNonCbsComponentsInProject,
                setIsLoadingComponents
            )
            fetchTemplatesList(jobNo)
        }
    }, [jobNo, fetchTemplatesList])

    //2. Event handlers
    const handleInputChange = (e) => {
        const { id, value } = e.target
        // Update field values
        setFieldValues((prevValues) => ({ ...prevValues, [id]: value }))

        // Dynamically check the input against the regex pattern and set error message
        const errorMessage = validateField(equipmentValidators, id, value)
        setFieldErrors((prevErrors) => ({ ...prevErrors, [id]: errorMessage }))
    }

    const handleTemplateChange = (event) => {
        const selectedTemplate = event.target.value
        const selectedTempObj = templatesList.find(
            (template) => template.Name === selectedTemplate
        )
        setSelectedTemplate(selectedTempObj)

        setFieldValues((prevState) => ({
            ...prevState,
            Template: selectedTemplate,
        }))
    }

    //CREATE multiple Equipment on file upload
    const handleFileUpload = async (event) => {
        setIsCreatingItems(true)
        setCreationStepMessage('Reading Excel file...')

        try {
            const file = event.target.files[0]
            const result = await handleEquipmentFileUpload(jobNo, file)

            if (!result.success) {
                if (result.errorMessages && result.errorMessages.length > 0) {
                    toast.error(result.errorMessages.join('; '))
                } else {
                    toast.error(result.error)
                }
                setIsCreatingItems(false)
                return
            }

            const {
                linesProcessed,
                uniqueEquipmentCount,
                successCount,
                failureCount,
                isUpdateOperation,
                errorMessages,
                equipmentAlreadyExisting,
                nonExistentTemplates,
            } = result

            displayToastMessagesOnFileUpload(
                linesProcessed,
                uniqueEquipmentCount,
                successCount,
                failureCount,
                isUpdateOperation,
                errorMessages,
                equipmentAlreadyExisting,
                nonExistentTemplates
            )
        } catch (error) {
            console.error('Error during file processing:', error)
            toast.error(`Error processing file: ${error.message}`)
        } finally {
            setIsCreatingItems(false)
            setCreationStepMessage('')
        }
    }

    //CREATE one Equipment
    const handleFormSubmit = async (e) => {
        e.preventDefault()

        const { isValid, fieldValues: validatedFieldValues } =
            validateFormFields(
                e,
                fieldNames,
                equipmentValidators,
                setIsValid,
                setFieldErrors
            )

        if (!isValid) return

        //Data of the new Equipment
        const newEquipmentData = { jobNo, ...validatedFieldValues }

        const result = await onEquipmentCreate(jobNo, newEquipmentData)
        if (result.success) {
            toast.success('Equipment successfully created.')
        } else if (result.type === 'exists') {
            toast.warning(result.error || 'This Equipment already exists.')
        } else {
            toast.error(
                result.error ||
                    'An error occurred while creating new Equipment.'
            )
        }
    }

    //Click on button Cancel
    const handleCancelClick = () => {
        setIsValid({
            Ref: null,
            Description: null,
            Section: null,
            Area: null,
            Template: true,
            CurrentRevision: null,
        })
        setFieldValues({
            Ref: '',
            Description: '',
            Section: '',
            Area: '',
            Template: templatesList.length > 0 ? templatesList[0].Name : '',
            CurrentRevision: '',
        })
        setFieldErrors({})

        if (templatesList.length > 0) {
            setSelectedTemplate(templatesList[0])
            getTemplateComponents(jobNo, templatesList[0].Name).then((data) =>
                setComponentsInTemplate(data || [])
            )
        }
    }

    //Displays the list of Components present in the selected Template
    const getTemplateComponents = async (jobNo, Template) => {
        try {
            const response = await fetch(
                generateTemplateComponentsURL(jobNo, Template)
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

    useEffect(() => {
        if (jobNo && isLoadingComponents) {
            componentsInSelectedTemplateTableGridApi?.showLoadingOverlay()
        } else if (componentsInSelectedTemplateTableGridApi) {
            componentsInSelectedTemplateTableGridApi?.hideOverlay()
        }
    }, [jobNo, isLoadingComponents, componentsInSelectedTemplateTableGridApi])

    useEffect(() => {
        if (jobNo) {
            fetchTemplatesList(jobNo)
            fetchEquipmentList(jobNo)
        }
    }, [jobNo, fetchTemplatesList, fetchEquipmentList])

    useEffect(() => {
        if (templatesList.length > 0 && !selectedTemplate) {
            const initialTemplate = templatesList[0]
            setSelectedTemplate(
                (prevTemplate) => prevTemplate || initialTemplate
            )
            setFieldValues((prevState) => ({
                ...prevState,
                Template: initialTemplate.Template,
            }))
        }
    }, [templatesList, selectedTemplate])

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
            <EquipmentViewContainer>
                <ComponentsInTemplateContainer>
                    <span className="grey-label left">
                        Components in selected Template
                    </span>
                    <div style={{ height: 'calc(100% - 16px)' }}>
                        <StyledAGGrid
                            className="ag-theme-quartz basic"
                            gridOptions={
                                componentsInSelectedTemplateTableGridOptions
                            }
                            rowData={filteredComponents}
                            overlayNoRowsTemplate="Select a Template."
                        />
                    </div>
                </ComponentsInTemplateContainer>
                <CreateEquipmentAndFileUploadContainer>
                    <CreateEquipmentContainer>
                        <div className="purple-label">
                            Create a new Equipment
                        </div>
                        <FormBase onSubmit={handleFormSubmit}>
                            <FieldsWrapper>
                                <EquipmentFieldsContainer>
                                    <FirstRowContainer>
                                        <CreateEquipmentFormField className="refField">
                                            <LabelInputContainer>
                                                <label htmlFor="Ref">
                                                    Reference
                                                </label>
                                                <input
                                                    id="Ref"
                                                    value={fieldValues.Ref}
                                                    onChange={handleInputChange}
                                                    className={
                                                        fieldClassesComputed.Ref
                                                    }
                                                    type="text"
                                                    placeholder="Ex: C01"
                                                    maxLength={80}
                                                />
                                            </LabelInputContainer>
                                            {fieldErrors['Ref'] && (
                                                <ErrorMessage>
                                                    {fieldErrors['Ref']}
                                                </ErrorMessage>
                                            )}
                                        </CreateEquipmentFormField>
                                        <CreateEquipmentFormField className="descriptionField">
                                            <LabelInputContainer className="descriptionFieldLabelInput">
                                                <label htmlFor="Description">
                                                    Description
                                                </label>
                                                <input
                                                    id="Description"
                                                    value={
                                                        fieldValues.Description
                                                    }
                                                    onChange={handleInputChange}
                                                    className={
                                                        fieldClassesComputed.Description
                                                    }
                                                    type="text"
                                                    placeholder="Max. 80 characters"
                                                    maxLength={80}
                                                />
                                            </LabelInputContainer>
                                            {fieldErrors['Description'] && (
                                                <ErrorMessage>
                                                    {fieldErrors['Description']}
                                                </ErrorMessage>
                                            )}
                                        </CreateEquipmentFormField>
                                    </FirstRowContainer>
                                    <SecondRowContainer>
                                        <CreateEquipmentFormField className="sectionField">
                                            <LabelInputContainer>
                                                <label htmlFor="Section">
                                                    Section
                                                </label>
                                                <input
                                                    id="Section"
                                                    value={fieldValues.Section}
                                                    onChange={handleInputChange}
                                                    className={
                                                        fieldClassesComputed.Section
                                                    }
                                                    type="text"
                                                    placeholder="Max. 20 characters"
                                                    maxLength={20}
                                                />
                                            </LabelInputContainer>
                                            {fieldErrors['Section'] && (
                                                <ErrorMessage>
                                                    {fieldErrors['Section']}
                                                </ErrorMessage>
                                            )}
                                        </CreateEquipmentFormField>
                                        <CreateEquipmentFormField className="areaField">
                                            <LabelInputContainer>
                                                <label htmlFor="Area">
                                                    Area
                                                </label>
                                                <input
                                                    id="Area"
                                                    value={fieldValues.Area}
                                                    onChange={handleInputChange}
                                                    className={
                                                        fieldClassesComputed.Area
                                                    }
                                                    type="text"
                                                    placeholder="Max. 40 characters"
                                                    maxLength={25}
                                                />
                                            </LabelInputContainer>
                                            {fieldErrors['Area'] && (
                                                <ErrorMessage>
                                                    {fieldErrors['Area']}
                                                </ErrorMessage>
                                            )}
                                        </CreateEquipmentFormField>
                                    </SecondRowContainer>
                                    <ThirdRowContainer>
                                        <CreateEquipmentFormField>
                                            <LabelInputContainer>
                                                <label htmlFor="Template">
                                                    Template
                                                </label>
                                                <select
                                                    id="Template"
                                                    value={fieldValues.Template}
                                                    onChange={
                                                        handleTemplateChange
                                                    }
                                                >
                                                    {templatesList.map(
                                                        (templateItem) => (
                                                            <option
                                                                key={
                                                                    templateItem.Name
                                                                }
                                                                value={
                                                                    templateItem.Name
                                                                }
                                                            >
                                                                {
                                                                    templateItem.Name
                                                                }
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </LabelInputContainer>
                                            {fieldErrors['Template'] && (
                                                <ErrorMessage>
                                                    {fieldErrors['Template']}
                                                </ErrorMessage>
                                            )}
                                            <span className="templateHours">
                                                Total Hours in Template:{' '}
                                                {selectedTemplate?.Hours}
                                            </span>
                                        </CreateEquipmentFormField>
                                        <CreateEquipmentFormField className="currentRevisionField">
                                            <LabelInputContainer>
                                                <label htmlFor="CurrentRevision">
                                                    Revision
                                                </label>
                                                <input
                                                    id="CurrentRevision"
                                                    value={
                                                        fieldValues.CurrentRevision
                                                    }
                                                    onChange={handleInputChange}
                                                    className={
                                                        fieldClassesComputed.CurrentRevision
                                                    }
                                                    type="text"
                                                    placeholder="Ex: A1"
                                                    maxLength={5}
                                                />
                                            </LabelInputContainer>
                                            {fieldErrors['CurrentRevision'] && (
                                                <ErrorMessage>
                                                    {
                                                        fieldErrors[
                                                            'CurrentRevision'
                                                        ]
                                                    }
                                                </ErrorMessage>
                                            )}
                                        </CreateEquipmentFormField>
                                    </ThirdRowContainer>
                                </EquipmentFieldsContainer>
                            </FieldsWrapper>

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
                        </FormBase>
                    </CreateEquipmentContainer>
                    <FileUploadContainer>
                        <div className="purple-label">
                            Load Equipment from file
                        </div>
                        <div className={'file-content'}>
                            <FileUploadButton onChange={handleFileUpload} />
                            <span className="file-loaded-indicator">
                                File should be Equiplist_Template.xlsx
                            </span>
                        </div>
                    </FileUploadContainer>
                </CreateEquipmentAndFileUploadContainer>
            </EquipmentViewContainer>
        </>
    )
}

export default EquipmentView
