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
import { onCellContextMenu } from '../utils/gridUtils'

//Styles and constants
import { StyledAGGrid } from '../styles/ag-grid'
import { colors, fonts } from '../styles/global-styles'
import {
    columnsMainTable,
    columnsViewByArea,
    columnsViewByAreaComp,
    columnsViewByAreaSectionComp,
    columnsViewByLabourAndMaterial,
    columnsViewBySection,
    columnsEquipInAreaComp,
    columnsEquipInAreaCompCables,
    columnsEquipInAreaSectionComp,
    columnsEquipInAreaSectionCompCables,
    columnsEquipInSection,
} from '../constants/ag-grid-columns'
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
import DetailsEquipmentDialogBox from '../components/DialogBoxes/DetailsEquipmentDialogBox'
import ViewTableDialogBox from '../components/DialogBoxes/ViewTableDialogBox'
import DeleteEquipmentDialogBox from '../components/DialogBoxes/DeleteEquipmentDialogBox'
import EditEquipmentDialogBox from '../components/DialogBoxes/EditEquipmentDialogBox'

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
    flex: 1.3;
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
    padding-top: 25px;
    padding-bottom: 15px;
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

/**
 * DashboardView: Represents the primary component for displaying and interacting with project data.
 * Contains and renders MainInfoSection, mainTable, viewTable, Summary, Buttons.
 *
 * @param {string} jobNo - The project number.
 * @param {string} viewType - The type of view selected by the user (View tab).
 * @param {boolean} autoRefreshEnabled - Flag to enable/disable auto-update feature for the view table.
 */
const DashboardView = () => {
    //1. State declarations
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
    const [refreshDataTrigger, setRefreshDataTrigger] = useState(false)
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

    //2. Data fetching with Hooks
    //Fetches project data based on the user-selected job number
    const {
        data: mainTableData = [],
        isLoading: isLoadingMainTable,
        error: mainTableError,
    } = useFetch(generateMainTableDataURL(jobNo), refreshDataTrigger)

    //Fetches data for the "view table" based on the user-selected jobNo and viewType
    const {
        data: viewTableData = [],
        isLoading: isLoadingViewTable,
        error: viewTableError,
    } = useFetch(
        generateViewTableURL(jobNo, viewType),
        refreshViewTableTrigger,
        localMainTableData
    )

    //3. Helper Functions
    const mainTableGridOptions = {
        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true,
        },
        columnDefs: columnsMainTable,
        rowSelection: 'single',
        getRowId: (params) => params.data.Ref,
        onCellContextMenu: (params) =>
            onCellContextMenu(params, setContextMenuState),
        overlayLoadingTemplate: overlayLoadingTemplateLightBlue,
        onGridReady: (params) => {
            setMainTableGridApi(params.api)
            params.api.updateGridOptions({ rowData: localMainTableData })
        },
        overlayNoRowsTemplate: 'No data available. Please select a project.',
        suppressScrollOnNewData: true,
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
        suppressScrollOnNewData: true,
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
                const response = await fetch(url, {
                    method: 'GET',
                    credentials: 'include',
                })

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
            case 'full-refresh':
                setRefreshDataTrigger((prevFlag) => !prevFlag)
                break
            default:
                console.error('Unknown action type:', actionType)
                return
        }

        fetchSummaryValues()
        setRefreshViewTableTrigger((prevFlag) => !prevFlag)
    }

    //4. useEffects (synchronise and update data dynamically)
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
        fetchSummaryValues()
    }, [jobNo, fetchSummaryValues, localMainTableData])

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
