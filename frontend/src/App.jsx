//Modules
import { Route, Routes, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useEffect, useState } from 'react'

//Hooks
import useStore from './hooks/useStore'

//Assets
import { RiShare2Line } from 'react-icons/ri'

//Components
import MainInfoSection from './components/MainInfoSection'
import ExportDialog from './components/DialogBoxes/ExportDialogBox'
import Sidebar from './components/Sidebar'

//Views
import DashboardView from './views/DashboardView'
import ProjectsView from './views/ProjectsView'
import CodesView from './views/CodesView'
import ComponentsView from './views/ComponentsView'
import TemplatesView from './views/TemplatesView'
import EquipmentView from './views/EquipmentView'
import CCsView from './views/CCsView'
import RevisionsView from './views/RevisionsView'
import TenderSectionsView from './views/TenderSectionsView'
import CableScheduleView from './views/CableScheduleView'
import MultiUpdateView from './views/MultiUpdateView'
import { generateCheckAuthURL, generateLoginURL } from './utils/apiConfig'

const AppContainer = styled.div`
    width: 100svw;
    height: 100svh;
    display: flex;
    padding: 10px;
    gap: 10px;
    background-color: #f7f6f3;
`

const MainContainer = styled.div`
    height: calc(100svh - 20px);
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 10px;
    color: black;
`

const InfoSectionExportContainer = styled.div`
    width: calc(100svw - 250px);
    display: flex;
    gap: 10px;
    background-color: #f7f6f3;
    color: black;
    border-radius: 10px;
`
const ExportContainer = styled.div`
    width: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 10px;
    background-color: white;
    color: #4b4b4b;
    border-radius: 10px;
    font-size: 9px;
    transition: background-color 0.1s, transform 50ms;

    &:hover {
        background-color: #ebebeb;
        color: #4b4b4b;
        cursor: pointer;
    }

    svg {
        width: 20px;
        height: 20px;
        padding: 4px;
    }
`

const ViewContainer = styled.div`
    width: calc(100svw - 250px);
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 10px;
    background-color: white;
    color: black;
    border-radius: 10px;
`

/**
 * @file Main component of the application.
 * Integrates the main routing logic.
 */
const App = () => {
    const {
        jobNo,
        jobTitle,
        jobAddress,
        viewType,
        onProjectSelect,
        fetchAllProjectData,
    } = useStore((state) => ({
        jobNo: state.jobNo,
        jobTitle: state.jobTitle,
        jobAddress: state.jobAddress,
        viewType: state.viewType,
        onProjectSelect: state.onProjectSelect,
        fetchAllProjectData: state.fetchAllProjectData,
    }))

    const [showExportDialog, setShowExportDialog] = useState(false)
    const navigate = useNavigate()

    const handleOpenExportDialog = () => {
        setShowExportDialog(true)
    }

    const handleCloseExportDialog = () => {
        setShowExportDialog(false)
    }

    // Fetch the project when jobNoFromUrl changes
    useEffect(() => {
        if (jobNo) {
            fetchAllProjectData(jobNo)
            onProjectSelect({ JobNo: jobNo })
        }
    }, [jobNo, fetchAllProjectData, onProjectSelect])

    // Prevents the default browser right click menu to appear in tables
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

    // Check if the user is authenticated when the app loads
    useEffect(() => {
        fetch(generateCheckAuthURL(), {
            method: 'GET',
            credentials: 'include',
        })
            .then((response) => {
                if (response.ok) {
                    return response.json()
                }
                throw new Error('Failed to authenticate')
            })
            .then((data) => {
                if (!data.authenticated) {
                    window.location.href = generateLoginURL()
                } else {
                    console.log('User is authenticated', data.user)
                }
            })

            .catch((err) => {
                console.error('Authentication error:', err)
                window.location.href = generateLoginURL()
            })
    }, [navigate])

    return (
        <>
            <AppContainer>
                <Sidebar />
                <MainContainer>
                    <InfoSectionExportContainer>
                        <MainInfoSection
                            jobNo={jobNo}
                            jobTitle={jobTitle}
                            jobAddress={jobAddress}
                        />
                        <ExportContainer onClick={handleOpenExportDialog}>
                            <RiShare2Line />
                            EXPORT
                        </ExportContainer>
                    </InfoSectionExportContainer>
                    <ViewContainer>
                        <Routes>
                            <Route
                                path="/:jobNo/dashboard"
                                element={<DashboardView />}
                            />
                            <Route
                                path="/:jobNo/components"
                                element={<ComponentsView />}
                            />
                            <Route
                                path="/:jobNo/templates"
                                element={<TemplatesView />}
                            />
                            <Route
                                path="/:jobNo/equipment"
                                element={<EquipmentView />}
                            />
                            <Route
                                path="/:jobNo/cable-schedules"
                                element={<CableScheduleView />}
                            />
                            <Route
                                path="/:jobNo/multi-update"
                                element={<MultiUpdateView />}
                            />
                            <Route
                                path="/:jobNo/revisions"
                                element={<RevisionsView />}
                            />
                            <Route path="/:jobNo/ccs" element={<CCsView />} />
                            <Route
                                path="/:jobNo/tender-sections"
                                element={<TenderSectionsView />}
                            />
                            <Route
                                path="/projects"
                                element={<ProjectsView />}
                            />
                            <Route path="/codes" element={<CodesView />} />
                        </Routes>
                    </ViewContainer>
                </MainContainer>
            </AppContainer>
            {showExportDialog && (
                <ExportDialog
                    jobNo={jobNo}
                    viewType={viewType}
                    onClose={handleCloseExportDialog}
                />
            )}
        </>
    )
}

export default App
