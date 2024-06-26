import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import mainLogo from '../assets/main-logo.png'
import {
    RiDashboardLine,
    RiToolsFill,
    RiFileList2Line,
    RiArchive2Line,
    RiGitBranchLine,
    RiCheckboxMultipleLine,
    RiListCheck,
    RiMailSendLine,
    RiListCheck3,
    RiBriefcaseLine,
    RiBarcodeLine,
} from 'react-icons/ri'

const SidebarContainer = styled.div`
    width: 200px;
    height: calc(100svh - 40px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 10px;
    background-color: #fff;
    color: black;
    border-radius: 10px;
    overflow: auto;
`

const Menu = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
`

const SidebarLink = styled(NavLink)`
    display: flex;
    padding: 15px;
    align-items: center;
    color: gray;
    text-decoration: none;
    border-radius: 5px;
    font-weight: lighter;

    &:hover {
        background-color: #f4f4f4;
    }

    &.active {
        background-color: #ebebeb;
        color: #4b4b4b;
    }

    svg {
        height: 20px;
        width: 20px;
        margin-right: 10px;
    }

    @media screen and (max-height: 800px) {
        padding-top: 10px;
        padding-bottom: 10px;
    }

    @media screen and (max-height: 700px) {
        padding-top: 8px;
        padding-bottom: 8px;
    }
`

const Sidebar = () => {
    return (
        <SidebarContainer>
            <Menu>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        paddingTop: '30px',
                        paddingBottom: '30px',
                    }}
                >
                    <img
                        src={mainLogo}
                        alt="Tickbook App Logo"
                        draggable="false"
                        style={{ width: '50px', height: '50px' }}
                    />
                </div>
                <SidebarLink to="/dashboard">
                    <RiDashboardLine />
                    DASHBOARD
                </SidebarLink>
                <SidebarLink to="/components">
                    <RiToolsFill />
                    COMPONENTS
                </SidebarLink>
                <SidebarLink to="/templates">
                    <RiFileList2Line />
                    TEMPLATES
                </SidebarLink>
                <SidebarLink to="/equipment">
                    <RiArchive2Line />
                    EQUIPMENT
                </SidebarLink>
                <SidebarLink to="/cable-schedules">
                    <RiGitBranchLine />
                    CABLE SCHEDULE
                </SidebarLink>
                <SidebarLink to="/multi-update">
                    <RiCheckboxMultipleLine /> MULTI UPDATE
                </SidebarLink>
                <SidebarLink to="/revisions">
                    <RiListCheck />
                    REVISIONS
                </SidebarLink>
                <SidebarLink to="/ccs">
                    <RiMailSendLine />
                    CCs
                </SidebarLink>
                <SidebarLink to="/tender-sections">
                    <RiListCheck3 />
                    TENDER SECTIONS
                </SidebarLink>
            </Menu>
            <Menu>
                <SidebarLink to="/">
                    <RiBriefcaseLine />
                    PROJECT
                </SidebarLink>
                <SidebarLink to="/codes">
                    <RiBarcodeLine />
                    CODES
                </SidebarLink>
            </Menu>
        </SidebarContainer>
    )
}

export default Sidebar
