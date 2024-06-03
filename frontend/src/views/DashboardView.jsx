//Modules
import PropTypes from 'prop-types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'

//Hooks
import { useFetch } from '../hooks/useFetch'

//Utils
import {
    generateEquipmentInAreaCompURL,
    generateEquipmentInAreaSectionCompURL,
    generateEquipmentInSectionURL,
    generateProjectDataURL,
    generateProjectSummaryValues,
    generateViewTableURL,
} from '../utils/apiConfig'

//Styles and constants
import { StyledAGGrid } from '../styles/tables'
import { colors } from '../styles/global-styles'
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

//Components
import Summary from '../components/Summary'
import {
    overlayLoadingTemplateDarkBlue,
    overlayLoadingTemplateLightBlue,
} from '../components/Common/Loader'

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

    span {
        align-self: end;
        color: #5e6066;
        font-size: smaller;
        font-style: italic;
    }
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

    span .value {
        padding-left: 3px;
        font-weight: 600;
        color: ${colors.darkBlueBgen};
    }
`

const SummaryContainer = styled.div`
    flex: 0.2;
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
 * @param {boolean} autoUpdateEnabled - Flag to enable/disable auto-update feature for the view table.
 */
const DashboardView = ({ jobNo, viewType, autoUpdateEnabled }) => {
    // 1. State declarations
    const [localMainTableData, setLocalMainTableData] = useState([])
    const [mainTableGridApi, setMainTableGridApi] = useState(null)
    const [viewTableGridApi, setViewTableGridApi] = useState(null)
    const [quickFilterText, setQuickFilterText] = useState('')
    const [contextMenuState, setContextMenuState] = useState({
        visible: false,
        position: { x: 0, y: 0 },
        rowData: null,
    })
    const [isDataChanged, setIsDataChanged] = useState(false)
    const [refreshViewTableTrigger, setRefreshViewTableTrigger] =
        useState(false)
    const [summaryValues, setSummaryValues] = useState({
        totalTenderHours: 0,
        totalRecoveredHours: 0,
        ddtCableSubConHours: 0,
        netHoursRecovered: 0,
        globalPercentComplete: 0,
    })
    const [restoreMainTableFocus, setRestoreMainTableFocus] = useState(null)

    // 2. Data fetching with Hooks
    //Fetches project data based on the user-selected job number
    const {
        data: projectData = [],
        isLoading: isLoadingProject,
        error: projectError,
    } = useFetch(generateProjectDataURL(jobNo))

    //Fetches data for the "view table" based on the user-selected jobNo and viewType
    const {
        data: viewTableData = [],
        isLoading: isLoadingViewTable,
        error: viewTableError,
    } = useFetch(
        generateViewTableURL(jobNo, viewType),
        refreshViewTableTrigger,
        autoUpdateEnabled ? localMainTableData : null
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

    // 5. useEffects (synchronise and update data dynamically)
    useEffect(() => {
        if (projectData?.mainTableData) {
            setLocalMainTableData(projectData.mainTableData)
        }
    }, [projectData])

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
        if (isLoadingProject) {
            mainTableGridApi?.showLoadingOverlay()
        } else if (!jobNo && !isLoadingProject) {
            mainTableGridApi?.showNoRowsOverlay()
        } else if (mainTableGridApi) {
            mainTableGridApi?.hideOverlay()
        }
    }, [localMainTableData, mainTableGridApi, isLoadingProject, jobNo])

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
        if (autoUpdateEnabled) {
            setRefreshViewTableTrigger((prev) => !prev)
        }
    }, [localMainTableData, autoUpdateEnabled])

    useEffect(() => {
        if (!autoUpdateEnabled) setIsDataChanged(true)
    }, [localMainTableData, autoUpdateEnabled])

    //Prevents the default browser right click menu to appear in tables
    useEffect(() => {
        const handleContextMenu = (event) => {
            if (
                event.target.closest('.main-table') ||
                event.target.closest('.view-table') ||
                event.target.closest('.purple-table')
            ) {
                event.preventDefault()
            }
        }

        document.addEventListener('contextmenu', handleContextMenu, true)

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu, true)
        }
    }, [])

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
    }, [jobNo, fetchSummaryValues])

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

    // 6. Computation and Memoisation
    //Extracts relevant project data and "memo"ises it to optimize performance by preventing unnecessary re-renders
    const {
        jobTitle,
        jobAddress,
        mainTableData = [],
    } = useMemo(() => {
        if (projectData?.projectInfo) {
            return {
                jobTitle: projectData.projectInfo.Title,
                jobAddress: projectData.projectInfo.Address,
                completion: projectData.projectInfo.CompLoaded?.toString(),
                mainTableData: projectData.mainTableData,
                viewTableData: viewTableData,
            }
        } else {
            if (!isLoadingProject && projectError && jobNo) {
                console.error('Data or project info missing:', projectError)
                toast.error('Data or project info missing.')
            }
            if (viewTableError) {
                console.error('View table data missing:', projectError)
                toast.error('View table data missing.')
            }
            return {}
        }
    }, [
        projectData,
        viewTableData,
        isLoadingProject,
        projectError,
        viewTableError,
        jobNo,
    ])

    return (
        <DashboardViewContainer>
            {/* Main information about the project */}

            {/* Main table with project data */}
            <MainTableContainer>
                {/* Search field for main table */}
                <LabelAndInputContainer>
                    <span>Equipment List</span>
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
                    />
                </div>
            </MainTableContainer>
            <ViewTableAndSummaryContainer>
                <ViewTableContainer>
                    <RefreshButton disabled={!isDataChanged}>
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
                        overlayNoRowsTemplate="&#8203;"
                    />
                    <ViewTableOptionsContainer>
                        <span>
                            Change View:
                            <span className="value">
                                AREA-SECTION-COMPONENT
                            </span>
                        </span>
                        <span>
                            Automatic Refresh:
                            <span className="value">ON</span>
                        </span>
                    </ViewTableOptionsContainer>
                </ViewTableContainer>
                {/* Summary values fetched along project data */}
                <SummaryContainer>
                    <Summary values={summaryValues} />
                </SummaryContainer>
            </ViewTableAndSummaryContainer>
        </DashboardViewContainer>
    )
}

DashboardView.propTypes = {
    jobNo: PropTypes.string,
    viewType: PropTypes.string,
    autoUpdateEnabled: PropTypes.bool,
}

export default DashboardView
