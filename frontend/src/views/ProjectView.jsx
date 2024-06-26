//Modules
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import styled from 'styled-components'

//Hooks
import useStore from '../hooks/useStore'

//Utils
import { generateProjectsURL } from '../utils/apiConfig'

//Styles and constants
import { StyledAGGrid } from '../styles/ag-grid'
import { columnsSelectProject } from '../constants/ag-grid-columns'

//Components
import { overlayLoadingTemplatePurple } from '../components/Common/Loader'
import {
    ButtonsContainer,
    ErrorMessage,
    FormBase,
    FormField,
    LabelInputContainer,
} from '../components/Common/FormBase'
import FormButton from '../components/Common/FormButton'

//Styled components declarations
const ProjectViewContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 10px;
    background-color: #f7f6f3;
`

const SelectProjectContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1.5;
    padding: 10px;
    background-color: white;
    color: black;
    border-radius: 10px;
`
const CreateProjectContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 0.6;
    background-color: white;
    color: black;
    border-radius: 10px;
    padding: 10px;
`

const CreateProjectFormFieldsContainer = styled.div`
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: space-around;
    margin-bottom: 10px;

    @media screen and (max-width: 1500px), screen and (max-height: 700px) {
        font-size: smaller;
    }
`

const CreateProjectFormField = styled(FormField)`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    text-align: end;

    label {
        width: fit-content;
    }

    &:nth-child(1) {
        input {
            flex-grow: 0;
            width: 7em;
        }
    }

    #numberErrorMessage {
        text-align: center;
        width: 84%;
    }
`

const ProjectView = () => {
    const navigate = useNavigate()
    const {
        projectsList,
        fetchProjectsList,
        isLoading,
        onProjectSelect,
        onProjectCreate,
    } = useStore((state) => ({
        projectsList: state.projectsList,
        fetchProjectsList: state.fetchProjectsList,
        isLoading: state.isLoading,
        onProjectSelect: state.onProjectSelect,
        onProjectCreate: state.onProjectCreate,
    }))

    const [selectProjectTableGridApi, setSelectProjectTableGridApi] =
        useState(null)
    const [isNumberValid, setIsNumberValid] = useState(null)
    const [isTitleValid, setIsTitleValid] = useState(null)
    const [isAddressValid, setIsAddressValid] = useState(null)
    const [titleErrorMessage, setTitleErrorMessage] = useState('')
    const [addressErrorMessage, setAddressErrorMessage] = useState('')
    const [numberErrorMessage, setNumberErrorMessage] = useState('')
    const [restoreTableFocus, setRestoreTableFocus] = useState(null)

    const selectProjectTableGridOptions = {
        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true,
        },
        columnDefs: columnsSelectProject,
        rowSelection: 'single',
        overlayLoadingTemplate: overlayLoadingTemplatePurple,
        onGridReady: (params) => {
            setSelectProjectTableGridApi(params.api)
            params.api.updateGridOptions({ rowData: projectsList })
        },
        onRowClicked: (params) => {
            onProjectSelect(params.data)
            navigate('/dashboard')
        },
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault()

        const number = e.target.elements.number.value
        const title = e.target.elements.title.value
        const address = e.target.elements.address.value

        const isNumberCurrentlyValid = number.length >= 6 && number.length <= 7
        const isTitleCurrentlyValid = title.length >= 3 && title.length <= 45
        const isAddressCurrentlyValid =
            address.length >= 3 && address.length <= 45

        setIsNumberValid(isNumberCurrentlyValid)
        setIsTitleValid(isTitleCurrentlyValid)
        setIsAddressValid(isAddressCurrentlyValid)

        if (!isNumberCurrentlyValid)
            setNumberErrorMessage('Number should be 6 or 7 characters.')
        else setNumberErrorMessage('')

        if (!isTitleCurrentlyValid)
            setTitleErrorMessage('Title should be at least 3 characters long.')
        else setTitleErrorMessage('')

        if (!isAddressCurrentlyValid)
            setAddressErrorMessage(
                'Address should be at least 3 characters long.'
            )
        else setAddressErrorMessage('')

        if (
            !isNumberCurrentlyValid ||
            !isTitleCurrentlyValid ||
            !isAddressCurrentlyValid
        )
            return

        try {
            const response = await fetch(generateProjectsURL(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ number, title, address }),
            })
            if (response.status === 409) {
                const responseBody = await response.json()
                console.error('Conflict Error:', responseBody.message)
                toast.warning('This Project already exists.')
            } else if (!response.ok) {
                console.error(
                    'Error:',
                    'An error occurred while creating a new Project.'
                )
                toast.error('An error occurred while creating a new Project.')
            } else if (response.ok) {
                const newProject = await response.json()
                toast.success(`Project ${number} successfully created.`)
                onProjectCreate(newProject)

                setRestoreTableFocus({
                    rowIndex: projectsList.length - 1,
                    column: 'Name',
                })
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error:', error)
        }
    }

    const handleCancelClick = () => {
        setIsNumberValid(null)
        setIsTitleValid(null)
        setIsAddressValid(null)
        setNumberErrorMessage('')
        setTitleErrorMessage('')
        setAddressErrorMessage('')
    }

    useEffect(() => {
        fetchProjectsList()
    }, [fetchProjectsList])

    useEffect(() => {
        if (isLoading) {
            selectProjectTableGridApi?.showLoadingOverlay()
        } else selectProjectTableGridApi?.hideOverlay()
    }, [projectsList, selectProjectTableGridApi, isLoading])

    useEffect(() => {
        if (
            restoreTableFocus &&
            selectProjectTableGridApi &&
            restoreTableFocus.rowIndex > 0
        ) {
            const { rowIndex, column } = restoreTableFocus
            selectProjectTableGridApi.ensureIndexVisible(rowIndex, 'middle')
            selectProjectTableGridApi.setFocusedCell(rowIndex, column)

            setRestoreTableFocus(null)
        }
    }, [restoreTableFocus, selectProjectTableGridApi])

    return (
        <ProjectViewContainer>
            <SelectProjectContainer>
                <span className="grey-label left">Projects List</span>
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        marginTop: '2px',
                    }}
                >
                    <StyledAGGrid
                        className="ag-theme-quartz purple-table"
                        gridOptions={selectProjectTableGridOptions}
                        rowData={projectsList}
                    />
                </div>
            </SelectProjectContainer>
            <CreateProjectContainer>
                {' '}
                <div className="purple-label">Create a new Project</div>
                <FormBase onSubmit={handleFormSubmit}>
                    <CreateProjectFormFieldsContainer>
                        <CreateProjectFormField>
                            <LabelInputContainer>
                                <label htmlFor="number">Project Number</label>
                                <input
                                    id="number"
                                    className={
                                        isNumberValid === null
                                            ? ''
                                            : (isNumberValid && 'valid') ||
                                              'invalid'
                                    }
                                    type="text"
                                    placeholder="Ex: X12345"
                                    maxLength={7}
                                />
                                {numberErrorMessage && (
                                    <ErrorMessage id="numberErrorMessage">
                                        {numberErrorMessage}
                                    </ErrorMessage>
                                )}
                            </LabelInputContainer>
                        </CreateProjectFormField>
                        <CreateProjectFormField>
                            <LabelInputContainer>
                                <label htmlFor="title">Project Title</label>
                                <input
                                    id="title"
                                    className={
                                        isTitleValid === null
                                            ? ''
                                            : (isTitleValid && 'valid') ||
                                              'invalid'
                                    }
                                    type="text"
                                    placeholder="Max. 45 characters"
                                    maxLength={45}
                                />
                            </LabelInputContainer>
                            {titleErrorMessage && (
                                <ErrorMessage>{titleErrorMessage}</ErrorMessage>
                            )}
                        </CreateProjectFormField>
                        <CreateProjectFormField>
                            <LabelInputContainer>
                                <label htmlFor="address">Project Address</label>
                                <input
                                    id="address"
                                    className={
                                        isAddressValid === null
                                            ? ''
                                            : (isAddressValid && 'valid') ||
                                              'invalid'
                                    }
                                    type="text"
                                    placeholder="Max. 45 characters"
                                    maxLength={45}
                                />
                            </LabelInputContainer>
                            {addressErrorMessage && (
                                <ErrorMessage>
                                    {addressErrorMessage}
                                </ErrorMessage>
                            )}
                        </CreateProjectFormField>
                    </CreateProjectFormFieldsContainer>
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
            </CreateProjectContainer>
        </ProjectViewContainer>
    )
}

export default ProjectView
