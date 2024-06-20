//Modules
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import Select from 'react-select'
import { FixedSizeList as List } from 'react-window'

//Hooks
import useStore from '../hooks/useStore'

//Utils
import {
    getClassForField,
    validateField,
    validateFormFields,
} from '../utils/validationFormFields'

//Helpers
import { ccsValidators } from '../helpers/ccsHelpers'

//Styles and constants
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
import { overlayLoadingTemplatePurple } from '../components/Common/Loader'

//Styled components declarations

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

const LabelSelectInputContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: end;
    background-color: white;
    margin-bottom: 2px;
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
        border: 1px solid #d9d9d9;
        border-radius: 5px;
        background-color: white;
        color: ${colors.purpleBgenDarker};
        transition: border-color 0.2s;

        &:focus,
        &:focus-visible {
            border: 1px solid ${colors.purpleBgen};
            box-shadow: 0 0 0 2px rgba(120, 111, 255, 0.1);
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

    @media screen and (max-width: 800px) {
        flex-direction: column;
    }
`

const AddCCFormField = styled(FormField)`
    display: flex;
    flex-direction: column;
    align-items: flex-start;

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

    @media screen and (max-width: 1150px), screen and (max-height: 700px) {
        font-size: smaller;
    }
`

const DescriptionLabelInputContainer = styled(LabelInputContainer)`
    align-items: baseline;
`

const DescriptionErrorMessage = styled(ErrorMessage)`
    top: 66px;
`

const SelectedEquipmentContainer = styled.div`
    width: 100%;
    cursor: pointer;
`

const MenuList = (props) => {
    const height = 35
    const { options, children, maxHeight, getValue } = props
    const [value] = getValue()
    const initialOffset = options.indexOf(value) * height

    return (
        <List
            height={maxHeight}
            itemCount={children.length}
            itemSize={height}
            initialScrollOffset={initialOffset}
        >
            {({ index, style }) => <div style={style}>{children[index]}</div>}
        </List>
    )
}

MenuList.propTypes = {
    options: PropTypes.array.isRequired,
    children: PropTypes.array.isRequired,
    maxHeight: PropTypes.number.isRequired,
    getValue: PropTypes.func.isRequired,
}

const customStyles = {
    control: (provided, state) => ({
        ...provided,
        borderColor: state.isFocused ? '#786FFF' : '#ced4da',
        '&:hover': {
            borderColor: '#786FFF',
        },
        boxShadow: state.isFocused
            ? '0 0 0 2px rgba(120, 111, 255, 0.1)'
            : null,
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: 9999,
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    multiValue: (provided) => ({
        ...provided,
        maxWidth: '15ch',
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    }),
}

const CCsView = () => {
    // State declarations
    const {
        jobNo,
        ccsList,
        fetchCCsList,
        localMainTableRefs,
        fetchLocalMainTableRefs,
        onCcCreate,
        onCcUpdate,
        isLoading,
    } = useStore((state) => ({
        jobNo: state.jobNo,
        ccsList: state.ccsList,
        fetchCCsList: state.fetchCCsList,
        localMainTableRefs: state.localMainTableRefs,
        fetchLocalMainTableRefs: state.fetchLocalMainTableRefs,
        onCcCreate: state.onCcCreate,
        onCcUpdate: state.onCcUpdate,
        isLoading: state.isLoading,
    }))

    const [selectedRefs, setSelectedRefs] = useState([])
    const [ccsHistoryTableGridApi, setCcsHistoryTableGridApi] = useState(null)
    const [quickFilterText, setQuickFilterText] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [fieldValues, setFieldValues] = useState({
        CcRef: '',
        DateImp: '',
        Description: '',
    })
    const [fieldErrors, setFieldErrors] = useState({
        CcRef: '',
        DateImp: '',
        Description: '',
    })
    const fieldNames = ['CcRef', 'DateImp', 'Description']
    const [, setIsValid] = useState({
        CcRef: null,
        DateImp: null,
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
            setCcsHistoryTableGridApi(params.api)
            params.api.updateGridOptions({ rowData: ccsList })
        },
        singleClickEdit: true,
        onCellValueChanged: (params) => {
            if (params.colDef.field === 'DateLift') {
                if (params.oldValue === params.newValue) return
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
        if (isLoading) {
            ccsHistoryTableGridApi?.showLoadingOverlay()
        } else ccsHistoryTableGridApi?.hideOverlay()
    }, [ccsList, ccsHistoryTableGridApi, isLoading])

    const handleInputChange = (e) => {
        const { id, value } = e.target
        // Update field values
        setFieldValues((prevValues) => ({ ...prevValues, [id]: value }))

        // Dynamically check the input against the regex pattern and set error message
        const errorMessage = validateField(ccsValidators, id, value)
        setFieldErrors((prevErrors) => ({ ...prevErrors, [id]: errorMessage }))
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault()

        const { isValid, fieldValues: validatedFieldValues } =
            validateFormFields(
                e,
                fieldNames,
                ccsValidators,
                setIsValid,
                setFieldErrors
            )

        if (!isValid) return

        if (!validatedFieldValues.DateImp)
            validatedFieldValues.DateImp = new Date().toISOString()

        const formattedDate = formatDateWithTimeIfNeeded(
            validatedFieldValues.DateImp
        )

        const ccData = {
            jobNo,
            SelectedRefs: selectedRefs,
            CcRef: validatedFieldValues.CcRef,
            DateImp: formattedDate,
            Description: validatedFieldValues.Description,
        }

        const { success, ccs, error } = await onCcCreate(jobNo, ccData)

        if (success) {
            toast.success(`${ccs.length} CCs successfully created.`)
        } else {
            console.error('Error:', error)
            toast.warning(error)
        }
    }

    const handleCancelClick = () => {
        setIsValid({
            CcRef: null,
            Date: null,
            Description: null,
        })
        setFieldValues({
            CcRef: '',
            Date: '',
            Description: '',
        })
        setFieldErrors({
            CcRef: '',
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

        const { success, error } = await onCcUpdate(
            jobNo,
            rowData.EquipRef,
            rowData.CcRef,
            newValue
        )

        if (success) {
            toast.success('CC successfully updated.')
        } else {
            console.error('Error:', error)
            toast.warning(error)
        }
    }

    const handleEquipmentChange = (selectedOptions) => {
        setSelectedRefs(selectedOptions.map((option) => option.value))
    }

    const equipmentOptions = localMainTableRefs.map((item) => ({
        value: item.Ref,
        label: item.Ref,
    }))

    return (
        <CCsViewContainer>
            <CCsDataContainer>
                <LabelSelectInputContainer>
                    <span className="grey-label">CCs List</span>
                    <StateSelectContainer>
                        Status:
                        <select
                            onChange={(e) => setSelectedStatus(e.target.value)}
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
                            onChange={(e) => setQuickFilterText(e.target.value)}
                        />
                    </div>
                </LabelSelectInputContainer>
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
                                <label htmlFor="CcRef">CC Ref</label>
                                <input
                                    id="CcRef"
                                    value={fieldValues.CcRef}
                                    onChange={handleInputChange}
                                    className={getClassForField(
                                        'CcRef',
                                        fieldErrors,
                                        fieldValues
                                    )}
                                    type="text"
                                    placeholder="Max. 25 characters"
                                    maxLength={25}
                                />
                            </LabelInputContainer>
                            {fieldErrors['CcRef'] && (
                                <ErrorMessage>
                                    {fieldErrors['CcRef']}
                                </ErrorMessage>
                            )}
                        </AddCCFormField>
                        <AddCCFormField>
                            <LabelInputContainer>
                                <label htmlFor="DateImp">Date</label>
                                <input
                                    id="DateImp"
                                    value={fieldValues.DateImp}
                                    onChange={handleInputChange}
                                    className={getClassForField(
                                        'DateImp',
                                        fieldErrors,
                                        fieldValues
                                    )}
                                    type="date"
                                />
                            </LabelInputContainer>
                            {fieldErrors['DateImp'] && (
                                <ErrorMessage>
                                    {fieldErrors['DateImp']}
                                </ErrorMessage>
                            )}
                        </AddCCFormField>
                        <AddCCFormField>
                            <DescriptionLabelInputContainer>
                                <label htmlFor="Description">Description</label>
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
                                    <DescriptionErrorMessage>
                                        {fieldErrors['Description']}
                                    </DescriptionErrorMessage>
                                )}
                            </DescriptionLabelInputContainer>
                        </AddCCFormField>
                    </FieldsWrapper>
                    <AddCCFormField>
                        <label
                            style={{
                                marginBottom: '3px',
                            }}
                        >
                            Selected Equipment Refs
                        </label>
                        <SelectedEquipmentContainer>
                            <Select
                                components={{ MenuList }}
                                options={equipmentOptions}
                                isMulti
                                onChange={handleEquipmentChange}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                menuPlacement="top"
                                styles={customStyles}
                            />
                        </SelectedEquipmentContainer>
                    </AddCCFormField>
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
    )
}

export default CCsView
