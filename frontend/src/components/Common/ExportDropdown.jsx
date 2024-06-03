//Modules
import PropTypes from 'prop-types'
import { toast } from 'react-toastify'
import styled from 'styled-components'

//Utils
import {
    exportFullDetail,
    exportMainTableData,
    exportViewTableData,
} from '../../utils/apiConfig'

//Styles and constants
import { colors, fonts } from '../../styles/global-styles'

//Components
import { DropdownItem } from './Dropdown'

export const ExportDropdownMenu = styled.ul`
    position: absolute;
    bottom: 100%;
    left: 0;
    width: 13em;
    margin-top: 7px;
    padding: 1px;
    color: ${colors.purpleBgen};
    background-color: white;
    border-radius: 5px;
    text-transform: capitalize;
    list-style: none;
    z-index: 1001;
    ${fonts.narrowRegular14}
    font-weight: bold;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);

    &.visible {
        animation: fadeInUp 0.2s forwards;
    }

    @keyframes fadeInUp {
        0% {
            opacity: 0;
            transform: translateY(7px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }

    img {
        padding-right: 10px;
        color: red;
    }
`

const ExportDropdown = ({ jobNo, viewType }) => {
    const handleExportFullDetail = () => {
        const url = exportFullDetail(jobNo)
        if (url) {
            const link = document.createElement('a')
            link.href = url
            link.click()
        }
        toast.info(`${jobNo} Full Detail exported.`)
    }

    const handleExportMainTableData = () => {
        const url = exportMainTableData(jobNo)
        if (url) {
            const link = document.createElement('a')
            link.href = url
            link.click()
        }
        toast.info(`${jobNo} Main Table data exported.`)
    }

    const handleExportViewTableData = () => {
        const url = exportViewTableData(jobNo, viewType)
        if (url) {
            const link = document.createElement('a')
            link.href = url
            link.click()
        }
        toast.info(`${jobNo} ${viewType} data exported.`)
    }

    return (
        <ExportDropdownMenu className="visible">
            <DropdownItem
                className="dropdown-item"
                onClick={handleExportFullDetail}
            >
                <img src="export.svg" alt="export icon" />
                Full Detail
            </DropdownItem>
            <DropdownItem
                className="dropdown-item"
                onClick={handleExportMainTableData}
            >
                <img src="export.svg" alt="export icon" />
                Main Table Data
            </DropdownItem>
            <DropdownItem
                className="dropdown-item"
                onClick={handleExportViewTableData}
            >
                <img src="export.svg" alt="export icon" />
                View Table Data
            </DropdownItem>
        </ExportDropdownMenu>
    )
}

ExportDropdown.propTypes = {
    jobNo: PropTypes.string,
    viewType: PropTypes.string.isRequired,
}

export default ExportDropdown
