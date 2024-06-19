import PropTypes from 'prop-types'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import {
    exportFullDetail,
    exportMainTableData,
    exportViewTableData,
} from '../../utils/apiConfig'
import { colors, fonts } from '../../styles/global-styles'
import CloseIcon from '../Common/CloseIcon'
import { DialogBoxContainer, DialogHeader } from '../../styles/dialog-boxes'
import { useEffect, useRef } from 'react'

const ExportDialogBoxContainer = styled(DialogBoxContainer)`
    width: 98%;
    min-width: 25em;
    max-width: 25em;
    max-height: 99%;
    background-color: white;
`

const DialogContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 25px;
    ${fonts.regular14};
    color: ${colors.black};
`
const OptionsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin: 10px;
`

const DialogButton = styled.button`
    width: 100%;
    padding: 15px;
    border: none;
    border-radius: 5px;
    background-color: #f4f4f4;
    color: black;
    cursor: pointer;
    transition: background-color 0.15s, transform 0.1s;

    &:hover {
        background-color: #ebebeb;
    }
`

const ExportDialog = ({ jobNo, viewType, onClose }) => {
    const dialogRef = useRef(null)
    const headerRef = useRef(null)

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

    return (
        <ExportDialogBoxContainer ref={dialogRef}>
            <DialogHeader ref={headerRef}>
                Export
                <CloseIcon $variant="black" onClose={onClose} />
            </DialogHeader>
            <DialogContent>
                Data exported in a .xlsx file.*
                <OptionsContainer>
                    <DialogButton onClick={handleExportFullDetail}>
                        Full Detail
                    </DialogButton>
                    <DialogButton onClick={handleExportMainTableData}>
                        Main Table Data
                    </DialogButton>
                    <DialogButton onClick={handleExportViewTableData}>
                        View Table Data
                    </DialogButton>
                </OptionsContainer>
                <div style={{ fontSize: 'smaller' }}>
                    *If you want to be able to rename and/or select where to
                    save the file on your disk, make sure to check your browser
                    settings for option &apos;Always ask me where to save
                    files&apos;.
                </div>
            </DialogContent>
        </ExportDialogBoxContainer>
    )
}

ExportDialog.propTypes = {
    jobNo: PropTypes.string,
    viewType: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
}

export default ExportDialog
