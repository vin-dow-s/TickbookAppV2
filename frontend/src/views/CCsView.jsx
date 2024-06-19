//Modules
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'

//Hooks
import useStore from '../hooks/useStore'

//Utils
import { generateProjectCCsURL, updateCCsURL } from '../utils/apiConfig'
import { ccDescriptionPattern, ccRefPattern } from '../utils/regexPatterns'
import {
    getClassForField,
    validateField,
    validateFormFields,
} from '../utils/validationFormFields'

//Styles and constants
import { Overlay } from '../styles/dialog-boxes'
import { colors } from '../styles/global-styles'
import { StyledAGGrid } from '../styles/ag-grid'
import { columnsCCsHistory } from '../constants/dialog-box-tables-columns'

//Components
import {
    ButtonsContainer,
    ErrorMessage,
    FormBase,
    FormField,
    LabelInputContainer,
} from '../components/Common/FormBase'
import FormButton from '../components/Common/FormButton'
import MainLoader from '../components/Common/MainLoader'
import { overlayLoadingTemplatePurple } from '../components/Common/Loader'

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

const CCsViewContainer = styled.div`
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

const CCsDataContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1.5;
    background-color: white;
    color: black;
    border-radius: 10px;
    padding: 10px;
`

const LabelAndInputContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: end;
    background-color: white;
    margin-bottom: 2px;
`

const AddCCFormContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 0.8;
    padding: 10px;
    background-color: white;
    color: black;
    border-radius: 10px;
`

const FieldsWrapper = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;
    gap: 10px;
    margin-bottom: 10px;

    @media screen and (max-width: 800px) {
        flex-direction: column;
    }
`

const AddCCFormField = styled(FormField)`
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    label {
        margin-bottom: 5px;
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

    @media screen and (max-width: 1500px), screen and (max-height: 700px) {
        font-size: smaller;
    }
`

const SelectedEquipmentContainer = styled.div`
    max-height: 10.3em;
    overflow-x: auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
`

const StateSelectContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 8px;
    gap: 10px;
    margin-left: 93px;

    select {
        padding: 10px;
        border: 1px solid ${colors.tablesBorders};
        border-radius: 5px;
        background-color: white;
        color: ${colors.purpleBgenDarker};
        transition: border-color 0.2s;
        border-color: ${colors.purpleBgen};

        &:focus {
            outline: none;
        }

        &::placeholder {
            font-style: italic;
            color: #888;
        }

        &.valid {
            border-color: #07bc0c;
        }

        &.invalid {
            border-color: #e74c3c;
        }
    }

    span {
        margin-right: 15px;
    }
`

const CCsView = () => {
    // State declarations
    const {
        jobNo,
        ccsList,
        fetchCCsList,
        localMainTableRefs,
        fetchLocalMainTableRefs,
        onCCsCreate,
        onCCsUpdate,
    } = useStore((state) => ({
        jobNo: state.jobNo,
        ccsList: state.ccsList,
        fetchCCsList: state.fetchCCsList,
        localMainTableRefs: state.localMainTableRefs,
        fetchLocalMainTableRefs: state.fetchLocalMainTableRefs,
        onCCsCreate: state.onCCsCreate,
        onCCsUpdate: state.onCCsUpdate,
    }))

    const [selectedRefs, setSelectedRefs] = useState([])
    const [ccsHistoryTableGridApi, setCCsHistoryTableGridApi] = useState(null)
    const [quickFilterText, setQuickFilterText] = useState('')
    const [isCreatingItems, setIsCreatingItems] = useState(false)
    const [creationStepMessage, setCreationStepMessage] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [fieldValues, setFieldValues] = useState({
        CCRef: '',
        Date: '',
        Description: '',
    })
    const [fieldErrors, setFieldErrors] = useState({
        CCRef: '',
        Date: '',
        Description: '',
    })
    const fieldNames = ['CCRef', 'Date', 'Description']
    const [, setIsValid] = useState({
        CCRef: null,
        Date: null,
        Description: null,
    })

    const CCsHistoryTableGridOptions = {
        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true,
        },
        columnDefs: columnsCCsHistory,
        rowSelection: 'single',
        overlayLoadingTemplate: overlayLoadingTemplatePurple,
        onGridReady: (params) => {
            setCCsHistoryTableGridApi(params.api)
            params.api.updateGridOptions({ rowData: ccsList })
        },
        singleClickEdit: true,
        onCellValueChanged: (params) => {
            if (params.colDef.field === 'DateLift') {
                const newCurrentStatus = params.newValue ? 'lifted' : 'current'

                if (params.oldValue === params.newValue) return

                const updatedCC = {
                    ...params.data,
                    DateLift: params.newValue,
                    Status: newCurrentStatus,
                }
                onCCsUpdate(updatedCC)
                onInputBlur(params)
            }
        },
        stopEditingWhenCellsLoseFocus: true,
    }

    useEffect(() => {
        if (jobNo) {
            fetchCCsList(jobNo)
            fetchLocalMainTableRefs(jobNo)
        }
    }, [jobNo, fetchCCsList, fetchLocalMainTableRefs])

    useEffect(() => {
        if (ccsHistoryTableGridApi && quickFilterText !== null) {
            ccsHistoryTableGridApi.updateGridOptions({ quickFilterText })
        }
    }, [ccsHistoryTableGridApi, quickFilterText])

    useEffect(() => {
        if (ccsHistoryTableGridApi && selectedStatus) {
            if (selectedStatus === 'all') {
                ccsHistoryTableGridApi.setFilterModel(null)
            } else {
                ccsHistoryTableGridApi.setFilterModel({
                    Status: {
                        type: 'equals',
                        filter: selectedStatus.toLowerCase(),
                    },
                })
            }
            ccsHistoryTableGridApi.onFilterChanged()
        }
    }, [ccsHistoryTableGridApi, selectedStatus])

    useEffect(() => {
        if (isCreatingItems) {
            ccsHistoryTableGridApi?.showLoadingOverlay()
        } else ccsHistoryTableGridApi?.hideOverlay()
    }, [ccsList, ccsHistoryTableGridApi, isCreatingItems])

    const handleInputChange = (e) => {
        const { id, value } = e.target
        setFieldValues((prevValues) => ({ ...prevValues, [id]: value }))

        const errorMessage = validateField(
            { CCRef: ccRefPattern, Description: ccDescriptionPattern },
            id,
            value
        )
        setFieldErrors((prevErrors) => ({
            ...prevErrors,
            [id]: errorMessage,
        }))
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault()

        const { isValid, fieldValues: validatedFieldValues } =
            validateFormFields(
                e,
                fieldNames,
                { CCRef: ccRefPattern, Description: ccDescriptionPattern },
                setIsValid,
                setFieldErrors
            )

        if (!isValid) return

        if (!validatedFieldValues.Date)
            validatedFieldValues.Date = new Date().toISOString()

        const formattedDate = formatDateWithTimeIfNeeded(
            validatedFieldValues.Date
        )

        try {
            const response = await fetch(generateProjectCCsURL(jobNo), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jobNo: jobNo,
                    SelectedRefs: selectedRefs,
                    CCRef: validatedFieldValues.CCRef,
                    Date: formattedDate,
                    Description: validatedFieldValues.Description,
                }),
            })

            if (response.ok) {
                const newCCs = await response.json()
                onCCsCreate(newCCs)
                toast.success(`CCs successfully created!`)
            } else {
                const responseBody = await response.json()
                console.error('Error:', responseBody.message)
                toast.warning(responseBody.message)
            }
        } catch (error) {
            console.error('An error occurred while creating CC:', error)
        }
    }

    const handleCancelClick = () => {
        setIsValid({
            CCRef: null,
            Date: null,
            Description: null,
        })
        setFieldValues({
            CCRef: '',
            Date: '',
            Description: '',
        })
        setFieldErrors({
            CCRef: '',
            Date: '',
            Description: '',
        })
    }

    const formatDateWithTimeIfNeeded = (selectedDate) => {
        const currentDate = new Date()
        const selectedDateTime = new Date(selectedDate)

        if (selectedDateTime.toDateString() === currentDate.toDateString()) {
            return new Date().toISOString()
        } else {
            return selectedDateTime.toISOString().split('T')[0]
        }
    }

    const onInputBlur = async (params) => {
        const rowData = params.data
        const columnName = params.column.colId
        const value = params.oldValue
        const newValue = params.newValue

        if (newValue === value || columnName !== 'DateLift') return

        try {
            const response = await fetch(
                updateCCsURL(jobNo, rowData.EquipRef, rowData.CcNr),
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        DateLift: newValue,
                    }),
                }
            )

            if (response.ok) {
                toast.success('CC successfully updated')
            }
        } catch (error) {
            console.error('Error updating CC:', error)
        }
    }

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
            <CCsViewContainer>
                <CCsDataContainer>
                    <LabelAndInputContainer>
                        <span className="grey-label">CCs List</span>
                        <StateSelectContainer>
                            Status:
                            <select
                                onChange={(e) =>
                                    setSelectedStatus(e.target.value)
                                }
                            >
                                <option value="all">All</option>
                                <option value="current">Current</option>
                                <option value="lifted">Lifted</option>
                            </select>
                        </StateSelectContainer>
                        <div
                            style={{
                                position: 'relative',
                                top: '0',
                                right: '0',
                            }}
                        >
                            <input
                                className="quick-filter-input purple"
                                type="text"
                                placeholder="Search in all columns..."
                                value={quickFilterText}
                                onChange={(e) =>
                                    setQuickFilterText(e.target.value)
                                }
                            />
                        </div>
                    </LabelAndInputContainer>
                    <div style={{ height: 'calc(100% - 32px)' }}>
                        <StyledAGGrid
                            className="ag-theme-quartz purple-table"
                            gridOptions={CCsHistoryTableGridOptions}
                            rowData={ccsList}
                        />
                    </div>
                </CCsDataContainer>
                <AddCCFormContainer>
                    <div className="purple-label">Create a New CC</div>
                    <FormBase onSubmit={handleFormSubmit}>
                        <FieldsWrapper>
                            <AddCCFormField>
                                <LabelInputContainer>
                                    <label htmlFor="CCRef">CC Ref</label>
                                    <input
                                        id="CCRef"
                                        value={fieldValues.CCRef}
                                        onChange={handleInputChange}
                                        className={getClassForField(
                                            'CCRef',
                                            fieldErrors,
                                            fieldValues
                                        )}
                                        type="text"
                                        placeholder="Max. 25 characters"
                                        maxLength={25}
                                    />
                                </LabelInputContainer>
                                {fieldErrors['CCRef'] && (
                                    <ErrorMessage>
                                        {fieldErrors['CCRef']}
                                    </ErrorMessage>
                                )}
                            </AddCCFormField>
                            <AddCCFormField>
                                <LabelInputContainer>
                                    <label htmlFor="Date">Date</label>
                                    <input
                                        id="Date"
                                        value={fieldValues.Date}
                                        onChange={handleInputChange}
                                        className={getClassForField(
                                            'Date',
                                            fieldErrors,
                                            fieldValues
                                        )}
                                        type="date"
                                    />
                                </LabelInputContainer>
                                {fieldErrors['Date'] && (
                                    <ErrorMessage>
                                        {fieldErrors['Date']}
                                    </ErrorMessage>
                                )}
                            </AddCCFormField>
                            <AddCCFormField>
                                <LabelInputContainer>
                                    <label htmlFor="Description">
                                        Description
                                    </label>
                                    <textarea
                                        id="Description"
                                        value={fieldValues.Description}
                                        onChange={handleInputChange}
                                        className={getClassForField(
                                            'Description',
                                            fieldErrors,
                                            fieldValues
                                        )}
                                        style={{ resize: 'none' }}
                                    />
                                    {fieldErrors['Description'] && (
                                        <ErrorMessage>
                                            {fieldErrors['Description']}
                                        </ErrorMessage>
                                    )}
                                </LabelInputContainer>
                            </AddCCFormField>
                            <AddCCFormField>
                                <label
                                    style={{
                                        marginBottom: '10px',
                                        marginRight: '0',
                                    }}
                                >
                                    Selected Equipment Refs
                                </label>
                                <SelectedEquipmentContainer>
                                    {localMainTableRefs.map((item) => (
                                        <div key={item.Ref}>
                                            <input
                                                type="checkbox"
                                                checked={selectedRefs.includes(
                                                    item.Ref
                                                )}
                                                onChange={() => {
                                                    if (
                                                        selectedRefs.includes(
                                                            item.Ref
                                                        )
                                                    ) {
                                                        setSelectedRefs(
                                                            selectedRefs.filter(
                                                                (ref) =>
                                                                    ref !==
                                                                    item.Ref
                                                            )
                                                        )
                                                    } else {
                                                        setSelectedRefs([
                                                            ...selectedRefs,
                                                            item.Ref,
                                                        ])
                                                    }
                                                }}
                                            />
                                            <span
                                                style={{ paddingLeft: '3px' }}
                                            >
                                                {item.Ref}
                                            </span>
                                        </div>
                                    ))}
                                </SelectedEquipmentContainer>
                            </AddCCFormField>
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
                </AddCCFormContainer>
            </CCsViewContainer>
        </>
    )
}

export default CCsView
