//Modules
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'

//Hooks
import { useFetch } from '../hooks/useFetch'
import useStore from '../hooks/useStore'

//Utils
import {
    generateProjectEquipmentRefsDescAreaURL,
    getProjectCabSizesURL,
} from '../utils/apiConfig'
import {
    validateField,
    validateFormFields,
} from '../utils/validationFormFields'
import {
    onCellContextMenu,
    restrictInputToNumbersInRange,
} from '../utils/gridUtils'

//Helpers
import {
    cabschedValidators,
    displayToastMessagesOnFileUpload,
    fieldClasses,
} from '../helpers/cabschedHelpers'

//Styles and constants
import { contextMenuOptions } from '../constants/context-menu'
import { Overlay } from '../styles/dialog-boxes'
import { colors } from '../styles/global-styles'
import { StyledAGGrid } from '../styles/ag-grid'
import { columnsCabscheds } from '../constants/ag-grid-columns'

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
import DeleteCabschedDialogBox from '../components/DialogBoxes/DeleteCabschedDialogBox'
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

const CabschedsViewContainer = styled.div`
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

const CabschedsDataContainer = styled.div`
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
    background-color: white;
    margin-bottom: 2px;
`

const CreateCabschedAndFileUploadContainer = styled.div`
    display: flex;
    flex: 1;
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

const CreateCabschedContainer = styled.div`
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

const CabschedsForm = styled(FormBase)`
    align-items: center;

    .cabschedsForm-label {
        position: absolute;
        top: -8px;
        left: 10px;
        padding: 0 5px;
        background-color: ${colors.mainFrameBackground};
        color: ${colors.purpleBgen};
        font-style: italic;
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

    @media screen and (max-width: 1500px), screen and (max-height: 700px) {
        font-size: smaller;
    }
`

const CreateCabschedFormFieldsContainer = styled(FieldsContainer)`
    display: flex;
    flex-direction: column;
    flex: 1;
    flex-wrap: wrap;

    .disabled {
        color: ${colors.tablesBorders};
    }

    .cabSizesMessage {
        text-align: center;
        font-size: smaller;
        color: #e74c3c;
    }
`

const FirstRowContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    width: 100%;

    .cabnum {
        input {
            width: 100px;
        }
    }
`

const SecondRowContainer = styled.div`
    display: flex;
    justify-content: space-between;
`

const CreateCabschedFormField = styled(FormField)`
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    label {
        margin-bottom: 5px;
    }

    select {
        min-width: 2em;
        max-width: 15em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        &:not(:focus) {
            text-overflow: ellipsis;
        }
    }

    &.length {
        input {
            width: 40px;
        }
    }

    &.equipRef {
        select {
            width: 10em;
        }
    }

    &.cabSize {
        padding-left: 5em;
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

        @media screen and (max-width: 1017px) {
            height: auto;
        }
    }

    .file-loaded-indicator {
        margin-top: 10px;
        text-align: center;
        font-style: italic;
        font-size: smaller;
        color: rgba(0, 0, 0, 0.5);
    }
`

//Main component of the file
const CabschedsView = () => {
    //1. State declarations
    const {
        jobNo,
        cabschedsList,
        isLoading,
        fetchCabschedsList,
        onCabschedCreate,
        onCabschedUpdate,
        onCabschedCompletionUpdate,
        onCabschedMarkedInstalled,
        handleCabschedFileUpload,
    } = useStore((state) => ({
        jobNo: state.jobNo,
        cabschedsList: state.cabschedsList,
        isLoading: state.isLoading,
        fetchCabschedsList: state.fetchCabschedsList,
        onCabschedCreate: state.onCabschedCreate,
        onCabschedUpdate: state.onCabschedUpdate,
        onCabschedCompletionUpdate: state.onCabschedCompletionUpdate,
        onCabschedMarkedInstalled: state.onCabschedMarkedInstalled,
        handleCabschedFileUpload: state.handleCabschedFileUpload,
    }))

    const [cabschedsTableGridApi, setCabschedsTableGridApi] = useState(null)
    const [contextMenuState, setContextMenuState] = useState({
        visible: false,
        position: { x: 0, y: 0 },
        rowData: null,
    })
    const [quickFilterText, setQuickFilterText] = useState('')
    const [, setIsValid] = useState({
        CabNum: null,
        CabSize: null,
        EquipRef: null,
        Length: null,
        AGlandArea: null,
    })
    const [fieldErrors, setFieldErrors] = useState({
        CabNum: '',
        CabSize: '',
        EquipRef: '',
        Length: '',
        AGlandArea: '',
    })
    const DEFAULT_VALUES = {
        CabNum: '',
        Length: 0,
        AGlandArea: '',
    }
    const [fieldValues, setFieldValues] = useState({
        ...DEFAULT_VALUES,
        ZGlandArea: '', // Initially empty, to be updated when Equipment data is loaded
    })
    const [selectedCabsched, setSelectedCabsched] = useState(null)
    const fieldNames = ['CabNum', 'CabSize', 'EquipRef', 'Length', 'AGlandArea']
    const [currentCabschedData, setCurrentCabschedData] = useState(null)
    const [isCreatingItems, setIsCreatingItems] = useState(false)
    const [isDeleteCabschedDialogBoxOpen, setIsDeleteCabschedDialogBoxOpen] =
        useState(false)
    const [creationStepMessage, setCreationStepMessage] = useState('')

    const {
        data: equipmentRefs,
        isLoading: isLoadingEquipmentRefs,
        error: equipmentRefsError,
    } = useFetch(generateProjectEquipmentRefsDescAreaURL(jobNo))

    const {
        data: cabSizesData = [],
        isLoading: isLoadingCabSizes,
        error: cabSizesError,
    } = useFetch(getProjectCabSizesURL(jobNo))

    //2. Helper Functions
    //Updates completion fields on click outside the input/press Enter
    const onInputBlur = async (event) => {
        const rowData = event.data
        const columnName = event.colDef.field
        const oldValue = event.oldValue
        const newValue = event.value

        if (oldValue === newValue) return

        let finalValue = newValue

        if (finalValue === '' || finalValue === null) {
            finalValue = 0
        }

        try {
            const response = await onCabschedCompletionUpdate(
                jobNo,
                rowData.CabNum,
                columnName,
                newValue
            )

            if (!response.success) {
                throw new Error(response.error || 'Failed to update Cabsched')
            }

            toast.success('Cable completion successfully updated.')
        } catch (error) {
            console.error('Error while updating the completion :', error)
            toast.error('Error while updating the completion.')
        }
    }

    const getRowStyle = (params) => {
        const { data } = params

        if (
            data.CabTest === 100 &&
            data.CabComp === 100 &&
            data.AGlandComp === 100 &&
            data.ZGlandComp === 100
        ) {
            return { backgroundColor: '#d6ffd6' }
        }

        return { backgroundColor: 'none' }
    }

    const cabschedsTableGridOptions = {
        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true,
        },
        columnDefs: columnsCabscheds,
        rowSelection: 'single',
        getRowId: (params) => params.data.CabNum,
        onCellContextMenu: (params) =>
            onCellContextMenu(params, setContextMenuState),
        overlayLoadingTemplate: overlayLoadingTemplatePurple,
        onGridReady: (params) => {
            setCabschedsTableGridApi(params.api)
            params.api.updateGridOptions({ rowData: cabschedsList })
        },
        singleClickEdit: true,
        onCellEditingStarted: (params) => {
            if (
                params.column.colId === 'CabComp' ||
                params.column.colId === 'AGlandComp' ||
                params.column.colId === 'ZGlandComp' ||
                params.column.colId === 'CabTest'
            ) {
                restrictInputToNumbersInRange()
            }
        },
        onCellEditingStopped: (params) => {
            onInputBlur(params)
            if (params.column.colId === 'CabComp') {
                params.api.refreshCells({
                    rowNodes: [params.node],
                    columns: ['CabTest'],
                    force: true,
                })
            }
        },
        stopEditingWhenCellsLoseFocus: true,
        getRowStyle: getRowStyle,
        suppressScrollOnNewData: true,
    }

    //3. Event handlers
    const handleInputChange = (e) => {
        const { id, value } = e.target
        let newFieldValues = { ...fieldValues, [id]: value }
        setFieldValues(newFieldValues)

        if (id === 'EquipRef') {
            const selectedEquipRef = equipmentRefs.find(
                (item) => item.Ref === value
            )
            if (selectedEquipRef.Area) {
                newFieldValues.ZGlandArea = selectedEquipRef.Area
            }
        }

        const errorMessage = validateField(cabschedValidators, id, value)
        setFieldErrors((prevErrors) => ({ ...prevErrors, [id]: errorMessage }))
    }

    const handleFileUpload = async (event) => {
        setIsCreatingItems(true)
        setCreationStepMessage('Reading Excel file...')

        try {
            const file = event.target.files[0]
            const result = await handleCabschedFileUpload(
                jobNo,
                file,
                cabschedsList,
                cabSizesData,
                equipmentRefs
            )

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
                successCount,
                failureCount,
                alreadyExists,
            } = result

            displayToastMessagesOnFileUpload(
                linesProcessed,
                successCount,
                failureCount,
                alreadyExists
            )
        } catch (error) {
            console.error('Error during file processing:', error)
            toast.error(`Error processing file: ${error.message}`)
        } finally {
            setIsCreatingItems(false)
            setCreationStepMessage('')
        }
    }

    //FORM submit: CREATE or UPDATE
    const handleFormSubmit = async (e) => {
        e.preventDefault()

        const { isValid, fieldValues: validatedFieldValues } =
            validateFormFields(
                e,
                fieldNames,
                cabschedValidators,
                setIsValid,
                setFieldErrors
            )

        if (!isValid) return

        // Create or update Cabsched logic
        if (selectedCabsched) {
            const response = await onCabschedUpdate(
                jobNo,
                selectedCabsched,
                validatedFieldValues,
                equipmentRefs,
                cabSizesData
            )
            if (response.success)
                toast.success('Cable schedule successfully updated!')
            else toast.error('Error updating the Cable.')

            setSelectedCabsched(null)
        } else {
            const matchingEquipRef = equipmentRefs.find(
                (item) => item.Ref === validatedFieldValues.EquipRef
            )

            const matchingComponent = cabSizesData.find(
                (component) => component.Name === validatedFieldValues.CabSize
            )

            if (!matchingComponent) {
                console.error(
                    'No matching component found for:',
                    validatedFieldValues.CabSize
                )
                toast.error(
                    'No matching component found. Please check the Cable Size.'
                )
                return
            }

            const cabschedData = {
                ...validatedFieldValues,
                ZGlandArea: matchingEquipRef
                    ? matchingEquipRef.Area || matchingEquipRef.Area
                    : '',
                Component_ID: matchingComponent.id,
            }

            const result = await onCabschedCreate(jobNo, cabschedData)
            if (result.success) {
                toast.success('Cable successfully created.')
            } else if (result.type === 'exists') {
                toast.warning(result.error || 'This Cable already exists.')
            } else {
                toast.error(
                    result.error ||
                        'An error occurred while creating new Cable.'
                )
            }
        }
    }

    //Click on option Edit in the context menu + check if Cabsched is editable
    const handleEditClick = async (cabschedData) => {
        try {
            setSelectedCabsched(cabschedData)

            if (cabschedData.isInstalled) {
                toast.warning('Cannot modify an installed Cable.')
                return
            }

            const updatedValues = {
                ...fieldValues,
                ...cabschedData,
            }

            // Find the matching EquipRef in mainTableData
            const matchingEquipRef = equipmentRefs.find(
                (item) => item.Ref === cabschedData.EquipRef
            )

            // If a matching EquipRef is found, update the ZGlandArea
            if (matchingEquipRef) {
                updatedValues.ZGlandArea =
                    matchingEquipRef.Area || matchingEquipRef.Area
            } else {
                updatedValues.ZGlandArea =
                    equipmentRefs[0].Area || equipmentRefs[0].Area
            }

            setFieldValues(updatedValues)
        } catch (error) {
            console.error('Error checking Cable:', error)
            toast.error('An error occurred. Please try again.')
        }
    }

    //Click on option "Mark as Installed" in the context menu
    const handleMarkInstalledClick = async (rowData) => {
        const matchingComponent = cabSizesData.find(
            (component) => component.Name === rowData.CabSize
        )

        if (matchingComponent) {
            if (rowData.CabComp !== 100)
                toast.warning(
                    'Cable must be installed first (Cable % Comp = 100)'
                )
            else {
                const result = await onCabschedMarkedInstalled(jobNo, rowData)

                if (result.success) {
                    if (result.markedCable.tickCabBySC)
                        toast.success('Cable marked as installed.')
                    else toast.success('Cable marked as not installed.')
                } else toast.error('Error marking Cable as installed.')
            }
        } else {
            console.error('Component not found for the given CabSize')
        }
    }

    //Click on button Cancel
    const handleCancelClick = () => {
        setIsValid({
            CabNum: null,
            CabSize: null,
            EquipRef: null,
            Length: null,
            AGlandArea: null,
            ZGlandArea: null,
        })
        setFieldValues({
            ...DEFAULT_VALUES,
            ZGlandArea: equipmentRefs[0].Area || equipmentRefs[0].Area || '',
        })

        setFieldErrors({})
        setSelectedCabsched(null)
    }

    const handleContextMenuOptionClick = (option, rowData) => {
        switch (option.action) {
            case 'editCabsched':
                handleEditClick(rowData)
                break
            case 'markInstalled':
                handleMarkInstalledClick(rowData)
                break
            case 'deleteCabsched':
                openDeleteCabschedDialogBox(rowData)
                break
        }
    }

    //If option "Delete Cable" is clicked in the context menu
    const openDeleteCabschedDialogBox = (rowData) => {
        setCurrentCabschedData(rowData)
        setIsDeleteCabschedDialogBoxOpen(true)
    }

    //4. useEffects
    //Update ZGlandArea when equipmentRefs is loaded
    useEffect(() => {
        if (equipmentRefs.length > 0) {
            setFieldValues((prevValues) => ({
                ...prevValues,
                ZGlandArea:
                    equipmentRefs[0].Area || equipmentRefs[0].Area || '',
            }))
        }
    }, [equipmentRefs])

    useEffect(() => {
        if (cabschedsTableGridApi && quickFilterText !== null) {
            cabschedsTableGridApi.updateGridOptions({ quickFilterText })
        }
    }, [cabschedsTableGridApi, quickFilterText])

    useEffect(() => {
        if (isLoading) {
            cabschedsTableGridApi?.showLoadingOverlay()
        } else if (cabschedsTableGridApi) {
            cabschedsTableGridApi?.hideOverlay()
        }
    }, [cabschedsList, cabschedsTableGridApi, isLoading])

    useEffect(() => {
        if (jobNo) fetchCabschedsList(jobNo)
    }, [jobNo, fetchCabschedsList])

    if (!isLoadingCabSizes && cabSizesError && jobNo) {
        console.error('Cable Sizes Data missing:', cabSizesError)
        toast.error('Cable Sizes Data missing.')
    }

    if (!isLoadingEquipmentRefs && equipmentRefsError && jobNo) {
        console.error(
            'Equipment Refs-Desc-Area Data missing:',
            equipmentRefsError
        )
        toast.error('Equipment Data missing.')
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
            <CabschedsViewContainer>
                <CabschedsDataContainer>
                    <LabelAndInputContainer>
                        <span className="grey-label">Cabscheds List</span>
                        <input
                            className="quick-filter-input purple"
                            type="text"
                            placeholder="Search in all columns..."
                            value={quickFilterText}
                            onChange={(e) => setQuickFilterText(e.target.value)}
                        />
                    </LabelAndInputContainer>
                    <div style={{ height: 'calc(100% - 32px)' }}>
                        <StyledAGGrid
                            className="ag-theme-quartz purple-table"
                            gridOptions={cabschedsTableGridOptions}
                            rowData={cabschedsList}
                        />
                    </div>
                    {contextMenuState.visible && (
                        <ContextMenu
                            position={{
                                top: contextMenuState.position.y,
                                left: contextMenuState.position.x,
                            }}
                            data={contextMenuState.rowData}
                            options={contextMenuOptions.cabschedsTable}
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
                </CabschedsDataContainer>
                <CreateCabschedAndFileUploadContainer>
                    <CreateCabschedContainer>
                        <div className="purple-label">
                            {' '}
                            {!selectedCabsched
                                ? 'Create a new Cabsched'
                                : 'Edit Cabsched'}
                        </div>
                        <CabschedsForm onSubmit={handleFormSubmit}>
                            <FieldsWrapper>
                                <CreateCabschedFormFieldsContainer>
                                    {!isLoadingCabSizes &&
                                        cabSizesData &&
                                        cabSizesData.length === 0 && (
                                            <span className="cabSizesMessage">
                                                No Cable Component available in
                                                project, please create a
                                                Component with Code
                                                &apos;cbs&apos; first.
                                            </span>
                                        )}
                                    <FirstRowContainer className="firstRow">
                                        <CreateCabschedFormField>
                                            <LabelInputContainer className="cabnum">
                                                <label htmlFor="CabNum">
                                                    Cable No.
                                                </label>
                                                <input
                                                    id="CabNum"
                                                    value={fieldValues.CabNum}
                                                    onChange={handleInputChange}
                                                    className={
                                                        fieldClasses.CabNum
                                                    }
                                                    type="text"
                                                    placeholder="Max. 45 char."
                                                    maxLength={45}
                                                />
                                            </LabelInputContainer>
                                            {fieldErrors['CabNum'] && (
                                                <ErrorMessage>
                                                    {fieldErrors['CabNum']}
                                                </ErrorMessage>
                                            )}
                                        </CreateCabschedFormField>
                                        <CreateCabschedFormField className="cabSize">
                                            <LabelInputContainer>
                                                <label htmlFor="CabSize">
                                                    Cable Size
                                                </label>
                                                <select
                                                    id="CabSize"
                                                    value={fieldValues.CabSize}
                                                    onChange={handleInputChange}
                                                >
                                                    {cabSizesData.map(
                                                        ({ Name, id }) => (
                                                            <option
                                                                key={id}
                                                                value={Name}
                                                            >
                                                                {Name}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </LabelInputContainer>
                                            {fieldErrors['CabSize'] && (
                                                <ErrorMessage>
                                                    {fieldErrors['CabSize']}
                                                </ErrorMessage>
                                            )}
                                        </CreateCabschedFormField>

                                        <CreateCabschedFormField className="equipRef">
                                            <LabelInputContainer>
                                                <label htmlFor="EquipRef">
                                                    Equip Ref
                                                </label>
                                                <select
                                                    id="EquipRef"
                                                    value={fieldValues.EquipRef}
                                                    onChange={handleInputChange}
                                                >
                                                    {Array.from(
                                                        equipmentRefs.map(
                                                            (item) => item.Ref
                                                        )
                                                    ).map((ref, index) => (
                                                        <option
                                                            key={index}
                                                            value={ref}
                                                        >
                                                            {ref}
                                                        </option>
                                                    ))}
                                                </select>
                                            </LabelInputContainer>
                                        </CreateCabschedFormField>
                                    </FirstRowContainer>
                                    <SecondRowContainer className="secondRow">
                                        <CreateCabschedFormField className="length">
                                            <LabelInputContainer>
                                                <label htmlFor="Length">
                                                    Cable Length
                                                </label>
                                                <input
                                                    id="Length"
                                                    value={fieldValues.Length}
                                                    onChange={handleInputChange}
                                                    className={
                                                        fieldClasses.Length
                                                    }
                                                    type="number"
                                                    step={0.01}
                                                />
                                            </LabelInputContainer>
                                            {fieldErrors['Length'] && (
                                                <ErrorMessage>
                                                    {fieldErrors['Length']}
                                                </ErrorMessage>
                                            )}
                                        </CreateCabschedFormField>
                                        <CreateCabschedFormField className="aGlandArea">
                                            <LabelInputContainer>
                                                <label htmlFor="AGlandArea">
                                                    A Gland Area
                                                </label>
                                                <input
                                                    id="AGlandArea"
                                                    value={
                                                        fieldValues.AGlandArea
                                                    }
                                                    onChange={handleInputChange}
                                                    className={
                                                        fieldClasses.AGlandArea
                                                    }
                                                    type="text"
                                                    placeholder="Max. 45 char."
                                                    minLength={2}
                                                    maxLength={45}
                                                />
                                            </LabelInputContainer>
                                            {fieldErrors['AGlandArea'] && (
                                                <ErrorMessage>
                                                    {fieldErrors['AGlandArea']}
                                                </ErrorMessage>
                                            )}
                                        </CreateCabschedFormField>
                                        <CreateCabschedFormField className="zGlandArea">
                                            <LabelInputContainer>
                                                <label htmlFor="ZGlandArea">
                                                    Z Gland Area
                                                </label>
                                                <input
                                                    id="ZGlandArea"
                                                    value={
                                                        fieldValues.ZGlandArea
                                                    }
                                                    onChange={handleInputChange}
                                                    type="text"
                                                    disabled
                                                    style={{
                                                        color: 'grey',
                                                        fontStyle: 'italic',
                                                    }}
                                                />
                                            </LabelInputContainer>
                                            {fieldErrors['ZGlandArea'] && (
                                                <ErrorMessage>
                                                    {fieldErrors['ZGlandArea']}
                                                </ErrorMessage>
                                            )}
                                        </CreateCabschedFormField>
                                    </SecondRowContainer>
                                </CreateCabschedFormFieldsContainer>
                            </FieldsWrapper>
                            <ButtonsContainer>
                                <FormButton type="submit" variant="submit">
                                    {selectedCabsched ? 'Update' : 'Create'}
                                </FormButton>
                                <FormButton
                                    type="reset"
                                    variant="cancel"
                                    onClick={handleCancelClick}
                                >
                                    Cancel
                                </FormButton>
                            </ButtonsContainer>
                        </CabschedsForm>
                    </CreateCabschedContainer>
                    <FileUploadContainer>
                        <div className="purple-label">
                            Load Cabsched(s) from File
                        </div>
                        <div className="file-content">
                            <FileUploadButton onChange={handleFileUpload} />
                            <span className="file-loaded-indicator">
                                File should be Cabscheds_Template.xlsx
                            </span>
                        </div>
                    </FileUploadContainer>
                </CreateCabschedAndFileUploadContainer>
                {/* Displays DeleteCabschedDialogBox when "Delete" context menu option is clicked */}
                {isDeleteCabschedDialogBoxOpen && (
                    <DeleteCabschedDialogBox
                        jobNo={jobNo}
                        cabschedData={currentCabschedData}
                        onClose={() => setIsDeleteCabschedDialogBoxOpen(false)}
                    />
                )}
            </CabschedsViewContainer>
        </>
    )
}

export default CabschedsView
