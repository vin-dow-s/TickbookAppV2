//Modules
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'

//Utils
import {
    alphanumericWithSpacesPattern,
    codeCodePattern,
} from '../utils/regexPatterns'
import { generateCodesURL } from '../utils/apiConfig'

//Styles and constants
import { StyledAGGrid } from '../styles/tables'
import { columnsCodes } from '../constants/dialog-box-tables-columns'

//Components
import { overlayLoadingTemplatePurple } from '../components/Common/Loader'
import { colors } from '../styles/global-styles'
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

    .purple-label {
        color: ${colors.purpleBgen};
        font-size: small;
        font-style: italic;
    }
`

const CodesListContainer = styled.div`
    flex: 1.5;
    background-color: white;
    color: black;
    border-radius: 10px;
    padding: 10px;

    .grey-label {
        color: #5e6066;
        font-size: smaller;
        font-style: italic;
    }
`
const CreateCodeContainer = styled.div`
    flex: 0.6;
    background-color: white;
    color: black;
    border-radius: 10px;
    padding: 10px;
`

const CreateCodeForm = styled(FormBase)`
    input {
        margin-left: 10px;
    }
`

const CreateCodeFormFieldsContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin-bottom: 10px;
    gap: 100px;
`

const CreateCodeFormField = styled(FormField)`
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

const CodesView = ({ jobNo }) => {
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
                toast.success(`Code ${code} successfully created!`)
                /*                 onCodeCreate(newCode)
                 */ setIsCodeValid(null)
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
        codesTableGridApi?.hideOverlay()
    }, [codesTableGridApi])

    return (
        <CodesViewContainer>
            <CodesListContainer>
                <span className="grey-label">Codes List</span>
                <div
                    style={{
                        height: 'calc(100% - 18px)',
                        width: '100%',
                        marginTop: '2px',
                    }}
                >
                    <StyledAGGrid
                        className="ag-theme-quartz purple-table"
                        gridOptions={codesTableGridOptions}
                    />
                </div>
            </CodesListContainer>
            <CreateCodeContainer>
                {' '}
                <span className="purple-label">Create a new Code</span>
                <CreateCodeForm onSubmit={handleFormSubmit}>
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
                </CreateCodeForm>
            </CreateCodeContainer>
        </CodesViewContainer>
    )
}

CodesView.propTypes = {
    jobNo: PropTypes.string,
}

export default CodesView
