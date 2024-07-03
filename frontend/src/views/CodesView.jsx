//Modules
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'

//Hooks
import useStore from '../hooks/useStore'

//Utils
import {
    alphanumericWithSpacesPattern,
    codeCodePattern,
} from '../utils/regexPatterns'
import { generateCodesURL } from '../utils/apiConfig'

//Styles and constants
import { StyledAGGrid } from '../styles/ag-grid'
import { columnsCodes } from '../constants/ag-grid-columns'

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
const CodesViewContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 10px;
    background-color: #f7f6f3;
`

const CodesListContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1.5;
    padding: 10px;
    background-color: white;
    color: black;
    border-radius: 10px;

    .grey-label {
        color: #5e6066;
        font-size: smaller;
        font-style: italic;
    }
`
const CreateCodeContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 0.6;
    padding: 10px;
    background-color: white;
    color: black;
    border-radius: 10px;
`

const CreateCodeFormFieldsContainer = styled.div`
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: center;
    margin-bottom: 10px;
    gap: 100px;

    @media screen and (max-width: 1017px), screen and (max-height: 700px) {
        font-size: smaller;
    }
`

const CreateCodeFormField = styled(FormField)`
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
            width: 3em;
        }
    }

    #numberErrorMessage {
        text-align: center;
        width: 84%;
    }
`

const CodesView = () => {
    const { codesList, fetchCodesList, isLoading, onCodeCreate } = useStore(
        (state) => ({
            codesList: state.codesList,
            fetchCodesList: state.fetchCodesList,
            isLoading: state.isLoading,
            onCodeCreate: state.onCodeCreate,
        })
    )

    const [codesTableGridApi, setCodesTableGridApi] = useState(null)
    const [isCodeValid, setIsCodeValid] = useState(null)
    const [isNameValid, setIsNameValid] = useState(null)
    const [codeErrorMessage, setCodeErrorMessage] = useState('')
    const [nameErrorMessage, setNameErrorMessage] = useState('')

    const codesTableGridOptions = {
        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true,
        },
        columnDefs: columnsCodes,
        rowSelection: 'single',
        overlayLoadingTemplate: overlayLoadingTemplatePurple,
        onGridReady: (params) => {
            setCodesTableGridApi(params.api)
            params.api.updateGridOptions({ rowData: null })
        },
        suppressScrollOnNewData: true,

    }

    const handleFormSubmit = async (e) => {
        e.preventDefault()

        const code = e.target.elements.code.value
        const name = e.target.elements.name.value

        const isCodeCurrentlyValid = codeCodePattern.test(code)
        const isNameCurrentlyValid = alphanumericWithSpacesPattern.test(name)

        setIsCodeValid(isCodeCurrentlyValid)
        setIsNameValid(isNameCurrentlyValid)

        if (!isCodeCurrentlyValid)
            setCodeErrorMessage('Code must be 3 characters long.')
        else setCodeErrorMessage('')

        if (!isNameCurrentlyValid)
            setNameErrorMessage('Name should be at least 3 characters long.')
        else setNameErrorMessage('')

        if (!isCodeCurrentlyValid || !isNameCurrentlyValid) return

        try {
            const response = await fetch(generateCodesURL(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, name }),
            })

            if (response.status === 409) {
                const responseBody = await response.json()
                console.error('Conflict Error:', responseBody.message)
                toast.warning('This Code already exists.')
            } else if (!response.ok) {
                console.error(
                    'Error:',
                    'An error occurred while creating a new Code.'
                )
                toast.error('An error occurred while creating a new Code.')
            } else if (response.ok) {
                const newCode = await response.json()
                toast.success(`Code ${code} successfully created.`)
                onCodeCreate(newCode)
                setIsCodeValid(null)
                setIsNameValid(null)
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error:', error)
        }
    }

    const handleCancelClick = () => {
        setIsCodeValid(null)
        setIsNameValid(null)
        setCodeErrorMessage('')
        setNameErrorMessage('')
    }

    useEffect(() => {
        fetchCodesList()
    }, [fetchCodesList])

    useEffect(() => {
        if (isLoading) {
            codesTableGridApi?.showLoadingOverlay()
        } else codesTableGridApi?.hideOverlay()
    }, [codesList, codesTableGridApi, isLoading])

    return (
        <CodesViewContainer>
            <CodesListContainer>
                <span className="grey-label left">Codes List</span>
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        marginTop: '2px',
                    }}
                >
                    <StyledAGGrid
                        className="ag-theme-quartz purple-table"
                        gridOptions={codesTableGridOptions}
                        rowData={codesList}
                    />
                </div>
            </CodesListContainer>
            <CreateCodeContainer>
                {' '}
                <div className="purple-label">Create a new Code</div>
                <FormBase onSubmit={handleFormSubmit}>
                    <CreateCodeFormFieldsContainer>
                        <CreateCodeFormField>
                            <LabelInputContainer>
                                <label htmlFor="code">Code</label>
                                <input
                                    id="code"
                                    className={
                                        isCodeValid === null
                                            ? ''
                                            : (isCodeValid && 'valid') ||
                                              'invalid'
                                    }
                                    type="text"
                                    placeholder="XXX"
                                    maxLength={3}
                                />
                            </LabelInputContainer>
                            {codeErrorMessage && (
                                <ErrorMessage>{codeErrorMessage}</ErrorMessage>
                            )}
                        </CreateCodeFormField>
                        <CreateCodeFormField>
                            <LabelInputContainer>
                                <label htmlFor="name">Name</label>
                                <input
                                    id="name"
                                    className={
                                        isNameValid === null
                                            ? ''
                                            : (isNameValid && 'valid') ||
                                              'invalid'
                                    }
                                    type="text"
                                    placeholder="Max. 45 characters"
                                    maxLength={45}
                                />
                            </LabelInputContainer>
                            {nameErrorMessage && (
                                <ErrorMessage>{nameErrorMessage}</ErrorMessage>
                            )}
                        </CreateCodeFormField>
                    </CreateCodeFormFieldsContainer>
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
            </CreateCodeContainer>
        </CodesViewContainer>
    )
}

CodesView.propTypes = {
    jobNo: PropTypes.string,
}

export default CodesView
