//Modules
import PropTypes from 'prop-types'
import styled from 'styled-components'

//Components
import { toast } from 'react-toastify'
import CloseIcon from '../../components/Common/CloseIcon'
import { ButtonsContainer, FormBase } from '../../components/Common/FormBase'
import FormButton from '../../components/Common/FormButton'
import {
    DialogBoxContainer,
    DialogContent,
    DialogHeader,
} from '../../styles/dialog-boxes'
import { useEffect, useRef } from 'react'
import useStore from '../../hooks/useStore'

const DeleteCabschedDialogBoxHeader = styled(DialogHeader)`
    position: relative;
    color: black;
    background: linear-gradient(
        180deg,
        rgba(231, 76, 60, 1) 0%,
        rgba(231, 76, 60, 1) 50%,
        rgba(231, 42, 30, 1) 100%
    );
    background-repeat: no-repeat;
`

const DeleteCabschedForm = styled(FormBase)`
    position: relative;
    justify-content: space-evenly;
    align-items: center;
    padding: 25px;
`

const DeleteMessage = styled.h4`
    display: flex;
    margin: 0;
    padding: 10px 0;
    gap: 15px;
    text-align: center;
    align-items: center;
`

//Main component of the file
const DeleteCabschedDialogBox = ({ jobNo, cabschedData, onClose }) => {
    const { onCabschedDelete } = useStore((state) => ({
        onCabschedDelete: state.onCabschedDelete,
    }))
    const dialogRef = useRef(null)
    const headerRef = useRef(null)

    const handleFormSubmit = async (e) => {
        e.preventDefault()

        if (!cabschedData) {
            toast.error('No cable schedule data available.')
            return
        }

        const result = await onCabschedDelete(jobNo, cabschedData.CabNum)

        if (result.success) {
            toast.success('Cable successfully deleted.')
            onClose()
        } else {
            toast.error(result.error)
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

    return (
        <DialogBoxContainer ref={dialogRef}>
            <DeleteCabschedDialogBoxHeader ref={headerRef}>
                {`Delete Cable number: ${cabschedData.CabNum}`}
                <CloseIcon $variant="black" onClose={onClose} />
            </DeleteCabschedDialogBoxHeader>
            <DialogContent>
                <DeleteCabschedForm onSubmit={handleFormSubmit}>
                    <DeleteMessage>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="32"
                            height="32"
                        >
                            <path
                                d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z"
                                fill="rgba(231,76,60,1)"
                            ></path>
                        </svg>
                        Are you sure you want to delete this Cable?
                        <br />
                    </DeleteMessage>
                    <ButtonsContainer>
                        <FormButton type="submit" variant="submit">
                            Delete
                        </FormButton>
                        <FormButton
                            type="reset"
                            variant="cancel"
                            onClick={onClose}
                        >
                            Cancel
                        </FormButton>
                    </ButtonsContainer>
                </DeleteCabschedForm>
            </DialogContent>
        </DialogBoxContainer>
    )
}

DeleteCabschedDialogBox.propTypes = {
    jobNo: PropTypes.string.isRequired,
    cabschedData: PropTypes.object.isRequired,
    onCabschedDelete: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
}

export default DeleteCabschedDialogBox
