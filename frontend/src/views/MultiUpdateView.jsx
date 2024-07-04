//Modules
import styled from 'styled-components'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

//Hooks
import useStore from '../hooks/useStore'

//Utils
import { restrictInputToNumbersInRange } from '../utils/gridUtils'

//Styles and constants
import { colors } from '../styles/global-styles'
import { StyledAGGrid } from '../styles/ag-grid'
import {
    columnsMultiUpdateCodes,
    columnsMultiUpdateEquipment,
} from '../constants/ag-grid-columns'

//Components
import {
    ButtonsContainer,
    FieldsContainer,
    FormBase,
    FormField,
    LabelInputContainer,
} from '../components/Common/FormBase'
import FormButton from '../components/Common/FormButton'
import { overlayLoadingTemplatePurple } from '../components/Common/Loader'

const MultiUpdateViewContainer = styled.div`
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

const MultiUpdateDataContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1.5;
    gap: 25px;
    padding: 10px;
    border-radius: 10px;
    background-color: white;
    color: black;
`

const MultiUpdateFieldsContainer = styled(FieldsContainer)`
    justify-content: center;
`

const MultiUpdateForm = styled(FormBase)`
    position: relative;
    justify-content: space-evenly;
    align-items: center;
    padding: 0 0 25px 0;

    .multiUpdateForm-label {
        position: absolute;
        top: -8px;
        left: 10px;
        background-color: ${colors.mainFrameBackground};
        color: ${colors.purpleBgen};
        font-style: italic;
    }

    input {
        margin-left: 0;
    }
`

const EquipmentAndCodesContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    gap: 25px;
    margin-bottom: 25px;

    label {
        font-size: small;
        font-style: italic;
        color: ${colors.purpleBgenDarker};
    }
`

const TablesWrapper = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
`

const MultiUpdateView = () => {
    //1. State declarations
    const {
        jobNo,
        equipmentList,
        fetchEquipmentCodes,
        onEquipmentCompletionByCodesBulkUpdate,
    } = useStore((state) => ({
        jobNo: state.jobNo,
        equipmentList: state.equipmentList,
        fetchEquipmentCodes: state.fetchEquipmentCodes,
        onEquipmentCompletionByCodesBulkUpdate:
            state.onEquipmentCompletionByCodesBulkUpdate,
    }))
    const [
        multiUpdateEquipmentTableGridApi,
        setMultiUpdateEquipmentTableGridApi,
    ] = useState(null)
    const [multiUpdateCodesTableGridApi, setMultiUpdateCodesTableGridApi] =
        useState(null)

    const DEFAULT_VALUES = {
        Section: equipmentList.length > 0 ? equipmentList[0].Section : '',
        Area: equipmentList.length > 0 ? equipmentList[0].Area : '',
    }
    const [fieldValues, setFieldValues] = useState(DEFAULT_VALUES)
    const [filteredCodes, setFilteredCodes] = useState([])
    const sectionsSet = new Set(equipmentList.map((equip) => equip.Section))
    const uniqueSections = [...sectionsSet].sort((a, b) => a.localeCompare(b))
    const areasSet = new Set(equipmentList.map((equip) => equip.Area))
    const uniqueAreas = [...areasSet].sort((a, b) => a.localeCompare(b))

    const multiUpdateEquipmentTableGridOptions = {
        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true,
        },
        columnDefs: columnsMultiUpdateEquipment,
        rowSelection: 'multiple',
        getRowId: (params) => params.data.ID,
        overlayLoadingTemplate: overlayLoadingTemplatePurple,
        overlayNoRowsTemplate: 'No Equipment in this Section for this Area.',
        onGridReady: (params) => {
            setMultiUpdateEquipmentTableGridApi(params.api)

            const initialFiltered = equipmentList.filter((equipment) => {
                return (
                    equipment.Section === DEFAULT_VALUES.Section &&
                    equipment.Area === DEFAULT_VALUES.Area
                )
            })

            params.api.updateGridOptions({ rowData: initialFiltered })
        },
        suppressScrollOnNewData: true,
    }

    const multiUpdateCodesTableGridOptions = {
        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true,
        },
        columnDefs: columnsMultiUpdateCodes,
        onGridReady: (params) => {
            setMultiUpdateCodesTableGridApi(params.api)
            params.api.updateGridOptions({ rowData: filteredCodes })
        },
        singleClickEdit: true,
        onCellEditingStarted: (params) => {
            if (params.column.colId === 'PercentComplete') {
                restrictInputToNumbersInRange()
            }
        },
        stopEditingWhenCellsLoseFocus: true,
        suppressScrollOnNewData: true,
    }

    useEffect(() => {
        if (equipmentList.length > 0) {
            const defaultSection = equipmentList[0].Section
            const defaultArea = equipmentList[0].Area
            setFieldValues({ Section: defaultSection, Area: defaultArea })
        }
    }, [equipmentList])

    useEffect(() => {
        const fetchCodes = async () => {
            const { success, data, error } = await fetchEquipmentCodes(
                jobNo,
                fieldValues.Area,
                fieldValues.Section
            )
            if (success) {
                setFilteredCodes(data)
                if (multiUpdateCodesTableGridApi) {
                    multiUpdateCodesTableGridApi.updateGridOptions({
                        rowData: data,
                    })
                }
            } else {
                console.error(
                    'Error fetching Components Codes for these Equipment:',
                    error
                )
                toast.error(
                    'Error fetching Components Codes for these Equipment.'
                )
            }
        }

        if (fieldValues.Area && fieldValues.Section) {
            const filtered = equipmentList.filter((equipment) => {
                return (
                    equipment.Section === fieldValues.Section &&
                    equipment.Area === fieldValues.Area
                )
            })
            if (multiUpdateEquipmentTableGridApi) {
                multiUpdateEquipmentTableGridApi.updateGridOptions({
                    rowData: filtered,
                })
            }
            fetchCodes()
        }
    }, [
        jobNo,
        equipmentList,
        fieldValues.Area,
        fieldValues.Section,
        fetchEquipmentCodes,
        multiUpdateEquipmentTableGridApi,
        multiUpdateCodesTableGridApi,
    ])

    const handleInputChange = (e) => {
        const { id, value } = e.target
        let newFieldValues = { ...fieldValues, [id]: value }
        setFieldValues(newFieldValues)

        const filtered = equipmentList.filter((equipment) => {
            return (
                equipment.Section === newFieldValues.Section &&
                equipment.Area === newFieldValues.Area
            )
        })

        if (multiUpdateEquipmentTableGridApi) {
            multiUpdateEquipmentTableGridApi.updateGridOptions({
                rowData: filtered,
            })
        }
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault()

        const selectedNodes =
            multiUpdateEquipmentTableGridApi.getSelectedNodes()
        const selectedData = selectedNodes.map((node) => node.data)
        const selectedRefs = selectedData.map((data) => data.Ref)

        if (selectedRefs.length === 0) {
            toast.warning('Please select at least one Equipment.')
            return
        }

        const updatedCodes = filteredCodes.filter(
            (code) => code.PercentComplete !== 'N/A'
        )

        if (updatedCodes.length === 0) {
            toast.warning('No Completion to update.')
            return
        }

        const payload = {
            selectedRefs: Array.from(selectedRefs),
            updatedCodes,
        }

        const { success, error } = await onEquipmentCompletionByCodesBulkUpdate(
            jobNo,
            payload
        )

        if (success) {
            setFilteredCodes((codes) =>
                codes.map((code) => ({ ...code, PercentComplete: 'N/A' }))
            )
            toast.success('Equipment Completions successfully updated.')
        } else {
            console.error('Failed to update Completion:', error)
            toast.error('Failed to update Completion of selected Equipment.')
        }
    }

    const handleCancelClick = () => {
        setFilteredCodes((codes) =>
            codes.map((code) => ({ ...code, PercentComplete: 'N/A' }))
        )
    }

    return (
        <MultiUpdateViewContainer>
            <MultiUpdateDataContainer>
                <MultiUpdateFieldsContainer>
                    <FormField>
                        <LabelInputContainer>
                            <label htmlFor="Section">Section</label>
                            <select
                                id="Section"
                                value={fieldValues.Section}
                                onChange={handleInputChange}
                            >
                                {uniqueSections.map((section) => (
                                    <option key={section}>{section}</option>
                                ))}
                            </select>
                        </LabelInputContainer>
                    </FormField>
                    <FormField>
                        <LabelInputContainer>
                            <label htmlFor="Area">Area</label>
                            <select
                                id="Area"
                                value={fieldValues.Area}
                                onChange={handleInputChange}
                            >
                                {uniqueAreas.map((area) => (
                                    <option key={area}>{area}</option>
                                ))}
                            </select>
                        </LabelInputContainer>
                    </FormField>
                </MultiUpdateFieldsContainer>
                <MultiUpdateForm onSubmit={handleFormSubmit}>
                    <EquipmentAndCodesContainer>
                        <TablesWrapper>
                            <span className="grey-label left">
                                Equipment List
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
                                        multiUpdateEquipmentTableGridOptions
                                    }
                                />
                            </div>
                        </TablesWrapper>
                        <TablesWrapper>
                            <span className="grey-label left">
                                Components Types
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
                                        multiUpdateCodesTableGridOptions
                                    }
                                    rowData={filteredCodes}
                                    overlayNoRowsTemplate="&#8203;"
                                />
                            </div>
                        </TablesWrapper>
                    </EquipmentAndCodesContainer>

                    <ButtonsContainer>
                        <FormButton type="submit" variant="submit">
                            Update
                        </FormButton>
                        <FormButton
                            type="reset"
                            variant="cancel"
                            onClick={handleCancelClick}
                        >
                            Cancel
                        </FormButton>
                    </ButtonsContainer>
                </MultiUpdateForm>
            </MultiUpdateDataContainer>
        </MultiUpdateViewContainer>
    )
}

export default MultiUpdateView
