//Modules
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import styled from 'styled-components'

//Hooks
import useStore from './hooks/useStore'

//Assets
import { RiShare2Line } from 'react-icons/ri'

//Components
import MainInfoSection from './components/MainInfoSection'
import Sidebar from './components/Sidebar'

//Views
import DashboardView from './views/DashboardView'
import ProjectView from './views/ProjectView'
import CodesView from './views/CodesView'
import ComponentsView from './views/ComponentsView'
import { useEffect } from 'react'
import TemplatesView from './views/TemplatesView'
import EquipmentView from './views/EquipmentView'

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
    const { jobNo, jobTitle, jobAddress } = useStore((state) => ({
        jobNo: state.jobNo,
        jobTitle: state.jobTitle,
        jobAddress: state.jobAddress,
    }))

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

    return (
        <Router>
            <AppContainer>
                <Sidebar />
                <MainContainer>
                    <InfoSectionExportContainer>
                        <MainInfoSection
                            jobNo={jobNo}
                            jobTitle={jobTitle}
                            jobAddress={jobAddress}
                        />
                        <ExportContainer>
                            <RiShare2Line />
                            EXPORT
                        </ExportContainer>
                    </InfoSectionExportContainer>
                    <ViewContainer>
                        <Routes>
                            <Route
                                path="/dashboard"
                                element={<DashboardView />}
                            />
                            <Route path="/revisions" />
                            <Route
                                path="/components"
                                element={<ComponentsView />}
                            />
                            <Route
                                path="/templates"
                                element={<TemplatesView />}
                            />
                            <Route
                                path="/equipment"
                                element={<EquipmentView />}
                            />
                            <Route path="/cable-schedules" />
                            <Route path="/multi-prog" />
                            <Route path="/revisions" />
                            <Route path="/ccs" />
                            <Route path="/tender-sections" />
                            <Route path="/" element={<ProjectView />} />
                            <Route path="/codes" element={<CodesView />} />
                        </Routes>
                    </ViewContainer>
                </MainContainer>
            </AppContainer>
        </Router>
    )
}

export default App
