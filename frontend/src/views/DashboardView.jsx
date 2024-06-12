//Modules
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'

//Hooks
import { useFetch } from '../hooks/useFetch'
import useStore from '../hooks/useStore'

//Utils
import {
    generateEquipmentInAreaCompURL,
    generateEquipmentInAreaSectionCompURL,
    generateEquipmentInSectionURL,
    generateMainTableDataURL,
    generateProjectSummaryValues,
    generateViewTableURL,
} from '../utils/apiConfig'

//Styles and constants
import { StyledAGGrid } from '../styles/tables'
import { colors, fonts } from '../styles/global-styles'
import {
    columnsMainTable,
    columnsViewByArea,
    columnsViewByAreaComp,
    columnsViewByAreaSectionComp,
    columnsViewByLabourAndMaterial,
    columnsViewBySection,
} from '../constants/main-tables-columns'
import {
    columnsEquipInAreaComp,
    columnsEquipInAreaCompCables,
    columnsEquipInAreaSectionComp,
    columnsEquipInAreaSectionCompCables,
    columnsEquipInSection,
} from '../constants/dialog-box-tables-columns'
import { contextMenuOptions } from '../constants/context-menu'

//Assets
import upArrow from '../assets/arrow-drop-up-line.svg'

//Components
import Summary from '../components/Summary'
import {
    overlayLoadingTemplateDarkBlue,
    overlayLoadingTemplateLightBlue,
} from '../components/Common/Loader'
import ContextMenu from '../components/Common/ContextMenu'
import {
    DROPDOWN_VIEWS,
    DropdownItem,
    DropdownMenu,
} from '../components/Common/Dropdown'
import DetailsEquipmentDialogBox from './DetailsEquipmentDialogBox'
import ViewTableDialogBox from './ViewTableDialogBox'
import DeleteEquipmentDialogBox from './DeleteEquipmentDialogBox'
import EditEquipmentDialogBox from './EditEquipmentDialogBox'

//Styled components declarations
const DashboardViewContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 10px;
    background-color: #f7f6f3;
`

const MainTableContainer = styled.div`
    height: calc(100% - 500px);
    position: relative;
    flex: 1.6;
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

const ViewTableAndSummaryContainer = styled.div`
    display: flex;
    flex: 1;
    gap: 10px;
    background-color: #f7f6f3;
    color: black;
    border-radius: 10px;
`

const ViewTableContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 0.8;
    background-color: white;
    color: black;
    border-radius: 10px;
    padding: 10px;
`

const ViewTableOptionsContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    background-color: white;
    color: gray;
    padding-top: 20px;
    padding-bottom: 10px;
`

const LabelValueContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    ${fonts.regular14}

    span {
        position: relative;
        display: flex;
        align-items: center;

        &.value {
            color: ${colors.darkBlueBgen};
            cursor: pointer;
        }
    }
`

const SummaryContainer = styled.div`
    flex: 0.2;
    min-width: 20em;
    background-color: white;
    color: black;
    border-radius: 10px;
    background-color: green;
`

const RefreshButton = styled.button`
    position: absolute;
    top: 12px;
    left: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    align-self: center;
    border: none;
    outline: none;
    background: transparent;
    padding: 0;
    margin: 0;
    z-index: 10;
    cursor: pointer;

    &:disabled svg {
        fill: #9c9c9c;
        cursor: initial;
    }
`

/**
 * DashboardView: Represents the primary component for displaying and interacting with project data.
 * Contains and renders MainInfoSection, mainTable, viewTable, Summary, Buttons.
 *
 * @param {string} jobNo - The project number.
 * @param {string} viewType - The type of view selected by the user (View tab).
 * @param {boolean} autoRefreshEnabled - Flag to enable/disable auto-update feature for the view table.
 */
const DashboardView = () => {
    // 1. State declarations
    const { jobNo, viewType, setViewType, dataHasChanged, setDataHasChanged } =
        useStore((state) => ({
            jobNo: state.jobNo,
            viewType: state.viewType,
            setViewType: state.setViewType,
            dataHasChanged: state.dataHasChanged,
            setDataHasChanged: state.setDataHasChanged,
        }))

    const [localMainTableData, setLocalMainTableData] = useState([])
    const [mainTableGridApi, setMainTableGridApi] = useState(null)
    const [quickFilterText, setQuickFilterText] = useState('')
    const [viewTableGridApi, setViewTableGridApi] = useState(null)
    const [viewTableDetails, setViewTableDetails] = useState(null)
    const [contextMenuState, setContextMenuState] = useState({
        visible: false,
        position: { x: 0, y: 0 },
        rowData: null,
    })
    const [refreshViewTableTrigger, setRefreshViewTableTrigger] =
        useState(false)
    const [summaryValues, setSummaryValues] = useState({
        totalTenderHours: 0,
        totalRecoveredHours: 0,
        ddtCableSubConHours: 0,
        netHoursRecovered: 0,
        globalPercentComplete: 0,
    })
    const [equipRef, setEquipRef] = useState(null)
    const [currentEquipmentData, setCurrentEquipmentData] = useState(null)
    const [isEditEquipmentDialogBoxOpen, setIsEditEquipmentDialogBoxOpen] =
        useState(false)
    const [isDeleteEquipmentDialogBoxOpen, setIsDeleteEquipmentDialogBoxOpen] =
        useState(false)
    const dropdownRef = useRef(null)
    const [isViewDropdownVisible, setIsViewDropdownVisible] = useState(false)
    const [restoreMainTableFocus, setRestoreMainTableFocus] = useState(null)
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)

    // 2. Data fetching with Hooks
    //Fetches project data based on the user-selected job number
    const {
        data: mainTableData = [],
        isLoading: isLoadingMainTable,
        error: mainTableError,
    } = useFetch(generateMainTableDataURL(jobNo))

    //Fetches data for the "view table" based on the user-selected jobNo and viewType
    const {
        data: viewTableData = [],
        isLoading: isLoadingViewTable,
        error: viewTableError,
    } = useFetch(
        generateViewTableURL(jobNo, viewType),
        refreshViewTableTrigger,
        autoRefreshEnabled ? localMainTableData : null
    )

    // 3. Helper Functions
    const onCellContextMenu = (params) => {
        const event = params.event
        event.preventDefault()
        setContextMenuState({
            visible: true,
            position: { x: event.clientX, y: event.clientY },
            rowData: params.node.data,
        })
    }

    const mainTableGridOptions = {
        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true,
        },
        columnDefs: columnsMainTable,
        rowSelection: 'single',
        getRowId: (params) => params.data.Ref,
        onCellContextMenu: onCellContextMenu,
        overlayLoadingTemplate: overlayLoadingTemplateLightBlue,
        onGridReady: (params) => {
            setMainTableGridApi(params.api)
            params.api.updateGridOptions({ rowData: localMainTableData })
        },
        overlayNoRowsTemplate: 'No data available. Please select a project.',
    }

    const viewTableGridOptions = {
        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true,
        },
        columnDefs: columnsViewBySection,
        rowSelection: 'single',
        overlayLoadingTemplate: overlayLoadingTemplateDarkBlue,
        onGridReady: (params) => {
            setViewTableGridApi(params.api)
            const columns = getConfigForView(viewType)
            if (columns?.columns) {
                params.api.updateGridOptions({ columnDefs: columns.columns })
            }
            params.api.updateGridOptions({ rowData: viewTableData })
        },
    }

    const isScheduleCable = (componentName) => {
        const pattern = /^(?!.*Non-).*\bSchedule Cable\b(?:\s|$)/
        return pattern.test(componentName)
    }

    /**
     * Provides configuration details based on the selected View type
     * Includes columns for the "view table", and if present, columns for its dialog boxes and URL generators to fetch their data
     */
    const getConfigForView = useCallback((viewType, componentName) => {
        switch (viewType) {
            case 'Area':
                return {
                    columns: columnsViewByArea,
                    urlGenerator: null,
                    dialogColumns: null,
                }
            case 'Area-Comp':
                return {
                    columns: columnsViewByAreaComp,
                    urlGenerator: (parameters) =>
                        generateEquipmentInAreaCompURL(parameters),
                    dialogColumns:
                        componentName && isScheduleCable(componentName)
                            ? columnsEquipInAreaCompCables
                            : columnsEquipInAreaComp,
                }
            case 'Area-Section-Comp':
                return {
                    columns: columnsViewByAreaSectionComp,
                    urlGenerator: (parameters) =>
                        generateEquipmentInAreaSectionCompURL(parameters),
                    dialogColumns:
                        componentName && isScheduleCable(componentName)
                            ? columnsEquipInAreaSectionCompCables
                            : columnsEquipInAreaSectionComp,
                }
            case 'Labour-Material':
                return {
                    columns: columnsViewByLabourAndMaterial,
                    urlGenerator: null,
                    dialogColumns: null,
                }
            case 'Section':
                return {
                    columns: columnsViewBySection,
                    urlGenerator: (parameters) =>
                        generateEquipmentInSectionURL(parameters),
                    dialogColumns: columnsEquipInSection,
                }
            default:
                return {
                    columns: columnsViewBySection,
                    urlGenerator: null,
                    dialogColumns: null,
                }
        }
    }, [])

    const fetchSummaryValues = useCallback(async () => {
        if (jobNo) {
            try {
                const url = generateProjectSummaryValues(jobNo)
                const response = await fetch(url)

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const newSummaryValues = await response.json()
                setSummaryValues(newSummaryValues)
            } catch (error) {
                console.error('Error fetching summary values:', error)
            }
        }
    }, [jobNo])

    // 4. Event handlers
    //Handles the user action of clicking a row in the main table
    const handleMainTableRowClick = (clickedItem) => {
        if (isEditEquipmentDialogBoxOpen || isDeleteEquipmentDialogBoxOpen) {
            toast.info('Close the current dialog box first.')
        } else {
            const equipRef = clickedItem.data.Ref
            setEquipRef(equipRef)
        }
    }

    //Handles the user action of clicking a row in the view table
    const handleViewTableRowClick = useCallback(
        (clickedItem) => {
            // Obtain the current view configuration
            const config = getConfigForView(
                viewType,
                clickedItem.data.Component
            )

            // Check if a URL generator exists for the current view
            if (config.urlGenerator) {
                // Generate the URL with necessary parameters
                const urlParams = {
                    jobNo: jobNo,
                    area: clickedItem.data.Area,
                    section: clickedItem.data.Section,
                    component: clickedItem.data.Component,
                    // Include additional parameters as needed
                }
                const dialogBoxURL = config.urlGenerator(urlParams)

                // Update the state to include all details needed for the dialog box
                setViewTableDetails({
                    url: dialogBoxURL,
                    columns: config.dialogColumns,
                    area: clickedItem.data.Area,
                    section: clickedItem.data.Section,
                    component: clickedItem.data.Component,
                    isOpen: true, // Flag to indicate that the dialog box should be opened
                })
            } else {
                // Handle cases where no dialog box should be opened or another action should be taken
            }
        },
        [viewType, jobNo, getConfigForView]
    )

    //Handles MainTable's context menu option click
    const handleContextMenuOptionClick = (option, rowData) => {
        switch (option.action) {
            case 'editEquipment':
                setCurrentEquipmentData(rowData)
                setIsEditEquipmentDialogBoxOpen(true)
                setEquipRef(null)
                setViewTableDetails(null)
                break
            case 'addCC':
                openAddCCDialogBox(rowData)
                break
            case 'deleteEquipment':
                setCurrentEquipmentData(rowData)
                setIsDeleteEquipmentDialogBoxOpen(true)
                setEquipRef(null)
                setViewTableDetails(null)
                break
        }

        setContextMenuState({ ...contextMenuState, visible: false })
    }

    const toggleViewDropdown = () => {
        setIsViewDropdownVisible((prev) => !prev)
    }

    const handleViewDropdownItemClick = (viewName) => {
        setViewType(viewName)
        setIsViewDropdownVisible(false)
    }

    const updateDashboardTablesAndSummary = (mainTableRow, actionType) => {
        switch (actionType) {
            case 'update':
                mainTableGridApi.applyTransaction({
                    update: [
                        {
                            Ref: mainTableRow.Ref || mainTableRow.EquipRef,
                            Section: mainTableRow.Section,
                            Description: mainTableRow.Description,
                            TotalHours: mainTableRow.TotalHours,
                            RecoveredHours: mainTableRow.RecoveredHours,
                            PercentComplete: mainTableRow.PercentComplete,
                            Area: mainTableRow.Area,
                        },
                    ],
                })
                break
            case 'delete':
                mainTableGridApi.applyTransaction({
                    remove: [
                        {
                            Ref: mainTableRow.Ref || mainTableRow.EquipRef,
                        },
                    ],
                })
                break
            case 'create':
                mainTableGridApi.applyTransaction({
                    add: [
                        {
                            Ref: mainTableRow.Ref || mainTableRow.EquipRef,
                            Section: mainTableRow.Section,
                            Description: mainTableRow.Description,
                            TotalHours: mainTableRow.TotalHours,
                            RecoveredHours: mainTableRow.RecoveredHours,
                            PercentComplete: mainTableRow.PercentComplete,
                            Area: mainTableRow.Area,
                        },
                    ],
                })
                break
            default:
                console.error('Unknown action type:', actionType)
                return
        }

        setTimeout(() => {
            const allNodes = []
            mainTableGridApi.forEachNodeAfterFilterAndSort((node) => {
                allNodes.push(node)
            })

            const updatedRowNode = allNodes.find(
                (node) => node.data.Ref === mainTableRow.Ref
            )

            if (updatedRowNode) {
                const updatedRowIndex = updatedRowNode.rowIndex
                mainTableGridApi.ensureIndexVisible(updatedRowIndex, 'middle')
                mainTableGridApi.setFocusedCell(updatedRowIndex, 'Ref')
                updatedRowNode.setSelected(true)
            }
        }, 0)

        fetchSummaryValues()
    }

    // Handler for manual refresh, if needed
    const handleManualRefresh = () => {
        setRefreshViewTableTrigger((prev) => !prev)
        setDataHasChanged(false)
    }

    // 5. useEffects (synchronise and update data dynamically)
    useEffect(() => {
        if (mainTableData) {
            setLocalMainTableData(mainTableData)
        }
    }, [mainTableData])

    useEffect(() => {
        if (mainTableGridApi && quickFilterText !== null) {
            mainTableGridApi.updateGridOptions({ quickFilterText })
        }
    }, [mainTableGridApi, quickFilterText])

    useEffect(() => {
        if (mainTableGridApi) {
            mainTableGridApi.updateGridOptions({ rowData: localMainTableData })
        }
    }, [localMainTableData, mainTableGridApi])

    useEffect(() => {
        if (isLoadingMainTable) {
            mainTableGridApi?.showLoadingOverlay()
        } else if (!jobNo && !isLoadingMainTable) {
            mainTableGridApi?.showNoRowsOverlay()
        } else if (mainTableGridApi) {
            mainTableGridApi?.hideOverlay()
        }
    }, [localMainTableData, mainTableGridApi, isLoadingMainTable, jobNo])

    useEffect(() => {
        const config = getConfigForView(viewType)
        if (viewTableGridApi && config.columns) {
            viewTableGridApi.updateGridOptions({ columnDefs: config.columns })
        }
    }, [viewType, viewTableGridApi, getConfigForView])

    useEffect(() => {
        if (viewTableGridApi) {
            if (isLoadingViewTable) {
                viewTableGridApi.showLoadingOverlay()
            } else {
                viewTableGridApi.hideOverlay()
            }
        }
    }, [viewTableGridApi, isLoadingViewTable])

    useEffect(() => {
        if (dataHasChanged && autoRefreshEnabled) {
            setRefreshViewTableTrigger((prev) => !prev)
            setDataHasChanged(false)
        }
    }, [
        autoRefreshEnabled,
        dataHasChanged,
        setDataHasChanged,
        setRefreshViewTableTrigger,
    ])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsViewDropdownVisible(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [dropdownRef])

    useEffect(() => {
        if (restoreMainTableFocus && mainTableGridApi) {
            const { column } = restoreMainTableFocus

            mainTableGridApi.forEachNodeAfterFilterAndSort((node) => {
                if (node.data.Ref === restoreMainTableFocus.ref) {
                    const updatedRowIndex = node.rowIndex
                    mainTableGridApi.ensureIndexVisible(
                        updatedRowIndex,
                        'middle'
                    )
                    mainTableGridApi.setFocusedCell(updatedRowIndex, column)
                    node.setSelected(true)
                    setRestoreMainTableFocus(null)
                }
            })
        }
    }, [restoreMainTableFocus, mainTableGridApi])

    useEffect(() => {
        fetchSummaryValues()
    }, [jobNo, fetchSummaryValues, localMainTableData])

    useEffect(() => {
        const clickOutside = (event) => {
            // Close the context menu if clicking outside
            if (
                contextMenuState.visible &&
                !event.target.closest('.context-menu-class')
            ) {
                setContextMenuState({ ...contextMenuState, visible: false })
            }
        }
        document.addEventListener('click', clickOutside)
        return () => {
            document.removeEventListener('click', clickOutside)
        }
    }, [contextMenuState])

    useEffect(() => {
        if (mainTableGridApi?.getDisplayedRowCount() > 0) {
            mainTableGridApi.ensureIndexVisible(0, 'top')
            mainTableGridApi.setFocusedCell(0, 'Ref')
        }
    }, [jobNo, mainTableGridApi])

    useEffect(() => {
        setQuickFilterText('')
    }, [jobNo])

    if (!isLoadingMainTable && mainTableError && jobNo) {
        console.error('Data or project info missing:', mainTableError)
        toast.error('Data or project info missing.')
    }

    if (viewTableError) {
        console.error('View table data missing:', mainTableError)
        toast.error('View table data missing.')
    }

    return (
        <DashboardViewContainer>
            {/* Main information about the project */}

            {/* Main table with project data */}
            <MainTableContainer>
                {/* Search field for main table */}
                <LabelAndInputContainer>
                    <span className="grey-label">Equipment List</span>
                    <input
                        className="quick-filter-input"
                        type="text"
                        placeholder="Search in all columns..."
                        value={quickFilterText}
                        onChange={(e) => setQuickFilterText(e.target.value)}
                    />
                </LabelAndInputContainer>
                <div style={{ height: 'calc(100% - 32px)' }}>
                    <StyledAGGrid
                        className="ag-theme-quartz main-table"
                        gridOptions={mainTableGridOptions}
                        onRowClicked={handleMainTableRowClick}
                    />
                </div>
                {contextMenuState.visible && (
                    <ContextMenu
                        className="visible"
                        position={{
                            top: contextMenuState.position.y,
                            left: contextMenuState.position.x,
                        }}
                        data={contextMenuState.rowData}
                        options={contextMenuOptions.mainTable}
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
            </MainTableContainer>
            {/* Displays DetailsEquipmentDialogBox when a row in main table is clicked */}
            {equipRef && (
                <DetailsEquipmentDialogBox
                    key={`${jobNo}-${equipRef}`}
                    jobNo={jobNo}
                    equipRef={equipRef}
                    isOpen={!!equipRef}
                    onClose={() => {
                        setEquipRef(null)
                    }}
                    updateDashboardTablesAndSummary={
                        updateDashboardTablesAndSummary
                    }
                />
            )}
            {/* Displays EditEquipmentDialogBox when "Edit" context menu option is clicked in MainTable */}
            {isEditEquipmentDialogBoxOpen && (
                <EditEquipmentDialogBox
                    jobNo={jobNo}
                    equipmentData={currentEquipmentData}
                    onClose={() => setIsEditEquipmentDialogBoxOpen(false)}
                    updateDashboardTablesAndSummary={
                        updateDashboardTablesAndSummary
                    }
                />
            )}
            {/* Displays DeleteEquipmentDialogBox when "Delete" context menu option is clicked in MainTable */}
            {isDeleteEquipmentDialogBoxOpen && (
                <DeleteEquipmentDialogBox
                    jobNo={jobNo}
                    equipmentData={currentEquipmentData}
                    onClose={() => setIsDeleteEquipmentDialogBoxOpen(false)}
                    updateDashboardTablesAndSummary={
                        updateDashboardTablesAndSummary
                    }
                />
            )}
            <ViewTableAndSummaryContainer>
                <ViewTableContainer>
                    <RefreshButton
                        onClick={handleManualRefresh}
                        disabled={!dataHasChanged}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            fill="rgba(0,102,128,1)"
                        >
                            <path d="M5.46257 4.43262C7.21556 2.91688 9.5007 2 12 2C17.5228 2 22 6.47715 22 12C22 14.1361 21.3302 16.1158 20.1892 17.7406L17 12H20C20 7.58172 16.4183 4 12 4C9.84982 4 7.89777 4.84827 6.46023 6.22842L5.46257 4.43262ZM18.5374 19.5674C16.7844 21.0831 14.4993 22 12 22C6.47715 22 2 17.5228 2 12C2 9.86386 2.66979 7.88416 3.8108 6.25944L7 12H4C4 16.4183 7.58172 20 12 20C14.1502 20 16.1022 19.1517 17.5398 17.7716L18.5374 19.5674Z"></path>
                        </svg>
                    </RefreshButton>
                    {/* Secondary table based on the selected View */}
                    <StyledAGGrid
                        className="ag-theme-quartz view-table"
                        gridOptions={viewTableGridOptions}
                        rowData={viewTableData}
                        onRowClicked={handleViewTableRowClick}
                        overlayNoRowsTemplate="&#8203;"
                    />
                    <ViewTableOptionsContainer>
                        <LabelValueContainer>
                            Change View:
                            <span
                                className="value"
                                onClick={toggleViewDropdown}
                            >
                                {viewType}
                                <img src={upArrow} alt="arrow-drop-up-line" />
                            </span>
                            {isViewDropdownVisible && (
                                <DropdownMenu
                                    ref={dropdownRef}
                                    className="visible"
                                >
                                    {DROPDOWN_VIEWS.map((viewName) => (
                                        <DropdownItem
                                            key={viewName}
                                            $isActive={viewName === viewType}
                                            onClick={() =>
                                                handleViewDropdownItemClick(
                                                    viewName
                                                )
                                            }
                                        >
                                            {viewName}
                                        </DropdownItem>
                                    ))}
                                </DropdownMenu>
                            )}
                        </LabelValueContainer>
                        <LabelValueContainer>
                            Automatic Refresh:
                            <span
                                className="value"
                                onClick={() =>
                                    setAutoRefreshEnabled((prev) => !prev)
                                }
                            >
                                {autoRefreshEnabled ? 'ON' : 'OFF'}
                            </span>
                        </LabelValueContainer>
                    </ViewTableOptionsContainer>
                </ViewTableContainer>
                {/* Displays ViewTableDialogBox when a row in view table is clicked */}
                {viewTableDetails?.isOpen && (
                    <ViewTableDialogBox
                        columns={viewTableDetails.columns}
                        fetchUrl={viewTableDetails.url}
                        initialArea={viewTableDetails.area}
                        initialSection={viewTableDetails.section}
                        initialComponent={viewTableDetails.component}
                        isOpen={viewTableDetails.isOpen}
                        onClose={() => {
                            setViewTableDetails(null)
                        }}
                    />
                )}
                {/* Summary values fetched along project data */}
                <SummaryContainer>
                    <Summary values={summaryValues} />
                </SummaryContainer>
            </ViewTableAndSummaryContainer>
        </DashboardViewContainer>
    )
}
export default DashboardView
