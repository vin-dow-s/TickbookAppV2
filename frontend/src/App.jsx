import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import styled from 'styled-components'
import MainInfoSection from './components/MainInfoSection'
import Sidebar from './components/Sidebar'
import { RiShare2Line } from 'react-icons/ri'
import DashboardView from './views/DashboardView'
import ProjectView from './views/ProjectView'
import CodesView from './views/CodesView'

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
 * Contains and renders Navbar (and its dialog boxes) and MainFrameView.
 * Integrates the main routing logic for project data fetches, and handles "global" user actions.
 */
const App = () => {
    return (
        <Router>
            <AppContainer>
                <Sidebar />
                <MainContainer>
                    <InfoSectionExportContainer>
                        <MainInfoSection
                            jobNo="X11661"
                            jobTitle="Syngenta"
                            jobAddress="Bracknell, UK"
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
                                element={
                                    <DashboardView
                                        jobNo="X11661"
                                        viewType="Section"
                                    />
                                }
                            />
                            <Route path="/revisions" />
                            <Route path="/components" />
                            <Route path="/templates" />
                            <Route path="/equipment" />
                            <Route path="/cable-schedules" />
                            <Route path="/multi-prog" />
                            <Route path="/revisions" />
                            <Route path="/ccs" />
                            <Route path="/tender-sections" />
                            <Route
                                path="/"
                                element={<ProjectView jobNo="X11661" />}
                            />
                            <Route
                                path="/codes"
                                element={<CodesView jobNo="X11661" />}
                            />
                        </Routes>
                    </ViewContainer>
                </MainContainer>
            </AppContainer>
        </Router>
    )
}

export default App
