//Modules
import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'

//Hooks
import { useFetch } from '../../hooks/useFetch'
import useStore from '../../hooks/useStore'

//Styles and constants
import {
    DialogBoxContainer,
    DialogContent,
    DialogHeader,
} from '../../styles/dialog-boxes'
import { colors } from '../../styles/global-styles'
import { columnsEquipRef } from '../../constants/ag-grid-columns'
import { StyledAGGrid } from '../../styles/ag-grid'

//Utils
import { generateEquipmentURL } from '../../utils/apiConfig'
import { restrictInputToNumbersInRange } from '../../utils/gridUtils'

//Components
import CloseIcon from '../Common/CloseIcon'
import { overlayLoadingTemplateLightBlue } from '../Common/Loader'
import FormButton from '../Common/FormButton'
import { FormField } from '../Common/FormBase'

//Styled components declarations
const DetailsEquipmentDialogBoxContainer = styled(DialogBoxContainer)`
    width: 80%;
    min-width: 50em;
    max-width: 70em;
    color: black;
    background-color: ${colors.tablesBackground};
`

const DetailsEquipmentDialogBoxHeader = styled(DialogHeader)`
    position: relative;
    color: black;
    background: ${colors.lightBlueBgenTransparent};
    background-repeat: no-repeat;
`

const DetailsEquipmentDialogBoxContent = styled(DialogContent)`
    height: 55vh;
    background-color: white;

    ${({ isLoading }) =>
        isLoading &&
        `
        display: flex;
        justify-content: center;
        align-items: center;
    `}
`

const TableWrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: 40vh;
    max-height: 50vh;
    flex-grow: 1;
    margin-bottom: 3em;
`

const EquipRefFormField = styled(FormField)`
    justify-content: center;
    gap: 10px;
`

//Main component of the file
const DetailsEquipmentDialogBox = ({
    jobNo,
    equipRef,
    isOpen,
    onClose,
    updateDashboardTablesAndSummary,
}) => {
    const {
        onEquipmentCompletionUpdate,
        onEquipmentCompletionByComponentsBulkUpdate,
    } = useStore((state) => ({
        onEquipmentCompletionUpdate: state.onEquipmentCompletionUpdate,
        onEquipmentCompletionByComponentsBulkUpdate:
            state.onEquipmentCompletionByComponentsBulkUpdate,
    }))

    const [equipRefTableGridApi, setEquipRefTableGridApi] = useState(null)
    const [equipmentList, setEquipmentList] = useState([])
    const encodedEquipRef = encodeURIComponent(equipRef)
    const [completionInput, setCompletionInput] = useState('')
    const [restoreTableFocus, setRestoreTableFocus] = useState(null)

    const dialogRef = useRef(null)
    const headerRef = useRef(null)

    //Fetch equipment list based on the Ref clicked in the main table
    const {
        isLoading: isLoadingEquipment,
        data: equipmentData = [],
        error: equipmentError,
    } = useFetch(generateEquipmentURL(jobNo, encodedEquipRef))

    //Updates completion fields on click outside the input/press Enter
    const onInputBlur = async (event) => {
        const rowData = event.data
        const oldValue = event.oldValue
        const newValue = event.value

        if (oldValue === newValue || isNaN(newValue)) return

        let finalValue = newValue

        if (finalValue === '' || finalValue === null) {
            finalValue = 0
        }

        let idToUpdate = rowData.ID

        if (['CableA', 'CableZ', 'CableT'].includes(rowData.Type)) {
            idToUpdate = idToUpdate.slice(0, -1)
        }

        try {
            const recalculatedRow = await onEquipmentCompletionUpdate(
                jobNo,
                idToUpdate,
                finalValue,
                rowData
            )
            if (rowData.CabNum)
                toast.success(
                    'Equipment and Cable Completions successfully updated.'
                )
            else toast.success('Equipment Completion successfully updated.')
            updateDashboardTablesAndSummary(recalculatedRow, 'update')
        } catch (error) {
            console.error('Failed during onInputBlur:', error)
            throw error
        }
    }

    const handleApplyCompletion = async () => {
        const selectedNodes = equipRefTableGridApi.getSelectedNodes()
        const selectedData = selectedNodes.map((node) => node.data)

        if (selectedData.length === 0) {
            toast.info('No rows selected.')
            return
        }

        const updates = selectedData
            .map((data) => {
                let idToUpdate = data.ID
                // Remove the last letter for cables AGland, ZGland and Test (added in the query to give them a unique ID)
                if (['CableA', 'CableZ', 'CableT'].includes(data.Type)) {
                    idToUpdate = idToUpdate.slice(0, -1)
                }

                const finalValue = parseFloat(completionInput)
                if (
                    !isNaN(finalValue) &&
                    data.LabNorm !== 0 &&
                    data.LabNorm !== null
                ) {
                    data.PercentComplete = finalValue
                    const newCurrentRecovery = finalValue * data.LabNorm
                    data.CurrentRecovery = newCurrentRecovery / 100

                    return {
                        id: idToUpdate,
                        percentComplete: finalValue,
                        type: data.Type,
                        ref: data.Ref,
                    }
                }
                return null
            })
            .filter((update) => update !== null)

        if (updates.length > 0) {
            try {
                const recalculatedRow =
                    await onEquipmentCompletionByComponentsBulkUpdate(
                        jobNo,
                        updates
                    )

                if (updates.some((update) => update.type === 'Cable'))
                    toast.success(
                        `${updates.length} Equipment and Cable Completions successfully updated.`
                    )
                else
                    toast.success(
                        `${updates.length} Equipment Completions successfully updated.`
                    )
                updateDashboardTablesAndSummary(recalculatedRow, 'update')
            } catch (error) {
                console.error('Error while updating the completion:', error)
                toast.error('An error occurred while updating completions.')
            }
        }

        setCompletionInput('')
        equipRefTableGridApi.deselectAll()
        equipRefTableGridApi.redrawRows({ rowNodes: selectedNodes })
    }

    const equipRefTableGridOptions = {
        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true,
        },
        columnDefs: columnsEquipRef,
        reactiveCustomComponents: true,
        rowSelection: 'multiple',
        getRowId: (params) => params.data.ID,
        overlayLoadingTemplate: overlayLoadingTemplateLightBlue,
        onGridReady: (params) => {
            setEquipRefTableGridApi(params.api)
            params.api.updateGridOptions({ rowData: equipmentList })
        },
        singleClickEdit: true,
        onCellEditingStarted: (params) => {
            if (params.column.colId === 'PercentComplete') {
                restrictInputToNumbersInRange()
            }
        },
        onCellEditingStopped: (params) => {
            onInputBlur(params)
        },
        stopEditingWhenCellsLoseFocus: true,
    }

    const handleCompletionInputChange = (e) => {
        let value = e.target.value
        if (value === '') {
            setCompletionInput('')
            return
        }

        const parsedValue = parseFloat(value)
        if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 100) {
            setCompletionInput(parsedValue)
        }
    }

    //Box Dragging logic
    useEffect(() => {
        const dialog = dialogRef.current
        const header = headerRef.current
        let offsetX = 0
        let offsetY = 0
        let isDragging = false

        const onMouseDown = (event) => {
            offsetX = event.clientX - dialog.getBoundingClientRect().left
            offsetY = event.clientY - dialog.getBoundingClientRect().top
            isDragging = true
        }

        const onMouseMove = (event) => {
            if (isDragging) {
                dialog.style.left = `${event.clientX - offsetX}px`
                dialog.style.top = `${event.clientY - offsetY}px`
                dialog.style.transform = `none`
            }
        }

        const onMouseUp = () => {
            isDragging = false
        }

        header.addEventListener('mousedown', onMouseDown)
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)

        return () => {
            header.removeEventListener('mousedown', onMouseDown)
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }
    }, [])

    //Update equipment list when fetched data changes
    useEffect(() => {
        if (Array.isArray(equipmentData)) {
            setEquipmentList(equipmentData)
        } else {
            setEquipmentList([])
        }
    }, [equipmentData])

    useEffect(() => {
        if (equipRefTableGridApi) {
            equipRefTableGridApi.updateGridOptions({
                rowData: equipmentList,
            })
        }
    }, [equipmentList, equipRefTableGridApi])

    useEffect(() => {
        equipRefTableGridApi?.sizeColumnsToFit()

        if (isLoadingEquipment) {
            equipRefTableGridApi?.showLoadingOverlay()
        } else if (equipRefTableGridApi && equipmentList.length > 0) {
            equipRefTableGridApi?.hideOverlay()
        }
    }, [equipmentList, equipRefTableGridApi, isLoadingEquipment])

    useEffect(() => {
        if (restoreTableFocus && equipRefTableGridApi) {
            const { rowIndex, column } = restoreTableFocus
            equipRefTableGridApi.ensureIndexVisible(rowIndex, 'middle')
            equipRefTableGridApi.setFocusedCell(rowIndex, column)

            setRestoreTableFocus(null)
        }
    }, [restoreTableFocus, equipRefTableGridApi])

    if (!isOpen) return null

    if (equipmentError) {
        console.error(
            'Error while fetching the equipment list:',
            equipmentError
        )
        toast.error('Error while fetching the equipment list.')
    }

    return (
        <DetailsEquipmentDialogBoxContainer ref={dialogRef}>
            <DetailsEquipmentDialogBoxHeader ref={headerRef}>
                Details Equip Ref: &#8203;
                <span>{equipRef}</span>
                <CloseIcon $variant="black" onClose={onClose} />
            </DetailsEquipmentDialogBoxHeader>
            <DetailsEquipmentDialogBoxContent>
                <TableWrapper>
                    <div
                        style={{
                            height: '100%',
                            width: '100%',
                        }}
                    >
                        <StyledAGGrid
                            className="ag-theme-quartz main-table no-border-radius no-border"
                            gridOptions={equipRefTableGridOptions}
                            rowData={equipmentList}
                        />
                    </div>
                </TableWrapper>
                <EquipRefFormField>
                    <input
                        type="number"
                        value={completionInput}
                        min={0}
                        max={100}
                        className="equipRef"
                        onChange={handleCompletionInputChange}
                        placeholder="% Complete"
                    />
                    <FormButton
                        variant="submit"
                        onClick={handleApplyCompletion}
                    >
                        Apply to Selected
                    </FormButton>
                </EquipRefFormField>
            </DetailsEquipmentDialogBoxContent>
        </DetailsEquipmentDialogBoxContainer>
    )
}

DetailsEquipmentDialogBox.propTypes = {
    jobNo: PropTypes.string.isRequired,
    equipRef: PropTypes.string,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    updateDashboardTablesAndSummary: PropTypes.func.isRequired,
}

DetailsEquipmentDialogBox.defaultProps = {
    equipRef: '',
}

export default DetailsEquipmentDialogBox
