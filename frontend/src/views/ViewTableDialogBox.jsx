//Modules
import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

//Hooks
import { useFetch } from '../hooks/useFetch'

//Styles and constants
import { DialogBoxContainer, DialogHeader } from '../styles/dialog-boxes'
import { colors, fonts } from '../styles/global-styles'
import { StyledAGGrid } from '../styles/tables'

//Components
import CloseIcon from '../components/Common/CloseIcon'
import { overlayLoadingTemplateDarkBlue } from '../components/Common/Loader'

//Styled components declarations
const ViewTableDialogBoxContainer = styled(DialogBoxContainer)`
    width: 80%;
    min-width: 50em;
    max-width: 70em;
    color: black;
    background-color: ${colors.tablesBackground};
`

const ViewTableDialogBoxHeader = styled(DialogHeader)`
    position: relative;
    display: flex;
    justify-content: left;
    gap: 5em;
    background: ${colors.darkBlueBgen};
    background-repeat: no-repeat;
    color: white;
    cursor: move;
    ${fonts.regular16}
`

const TableWrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: 50vh;
    max-height: 50vh;
    flex-grow: 1;
`

//Main component of the file
const ViewTableDialogBox = ({
    initialArea,
    initialSection,
    initialComponent,
    columns,
    isOpen,
    onClose,
    fetchUrl,
}) => {
    const [viewTableGridApi, setViewTableGridApi] = useState(null)

    const dialogRef = useRef(null)
    const headerRef = useRef(null)

    const viewTableGridOptions = {
        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true,
        },
        columnDefs: columns,
        rowSelection: 'single',
        overlayLoadingTemplate: overlayLoadingTemplateDarkBlue,
        onGridReady: (params) => {
            setViewTableGridApi(params.api)
            params.api.updateGridOptions({ rowData: equipmentList })
        },
    }

    //Local state to handle equipment reference and list (not dependent of MainFrameView)
    const { isLoading, data: equipmentList } = useFetch(fetchUrl)

    useEffect(() => {
        if (isLoading) {
            viewTableGridApi?.showLoadingOverlay()
        } else viewTableGridApi?.hideOverlay()
    }, [equipmentList, viewTableGridApi, isLoading])

    //Dialog box header depending on the selected View
    const generateHeaderTitle = () => {
        if (initialArea && initialSection && initialComponent) {
            return (
                <>
                    <span>
                        Area: <span className="value">{initialArea}</span>
                    </span>
                    <span>
                        Section: <span className="value">{initialSection}</span>
                    </span>
                    <span>
                        Type: <span className="value">{initialComponent}</span>
                    </span>
                </>
            )
        } else if (initialArea && initialComponent) {
            return (
                <>
                    <span>Area: {initialArea}</span>
                    <span>Type: {initialComponent}</span>
                </>
            )
        } else {
            return <span>Section: {initialSection}</span>
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

    if (!isOpen) return null

    return (
        <ViewTableDialogBoxContainer ref={dialogRef}>
            <ViewTableDialogBoxHeader ref={headerRef}>
                {generateHeaderTitle()}
                <CloseIcon $variant="white" onClose={onClose} />
            </ViewTableDialogBoxHeader>
            <TableWrapper>
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                    }}
                >
                    <StyledAGGrid
                        className="ag-theme-quartz view-table no-border-radius no-border"
                        gridOptions={viewTableGridOptions}
                        rowData={equipmentList}
                    />
                </div>
            </TableWrapper>
        </ViewTableDialogBoxContainer>
    )
}

ViewTableDialogBox.propTypes = {
    initialSection: PropTypes.string,
    initialArea: PropTypes.string,
    initialComponent: PropTypes.string,
    columns: PropTypes.array.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    fetchUrl: PropTypes.string,
}

ViewTableDialogBox.defaultProps = {
    initialSection: '',
    initialArea: '',
    initialComponent: '',
    fetchUrl: '',
}

export default ViewTableDialogBox
