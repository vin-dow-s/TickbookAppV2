//Modules
import PropTypes from 'prop-types'
import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { toast } from 'react-toastify'

//Hooks
import useStore from '../hooks/useStore'

//Styles and constants
import {
    DialogBoxContainer,
    DialogContent,
    DialogHeader,
} from '../styles/dialog-boxes'
import { fonts } from '../styles/global-styles'

//Components
import CloseIcon from '../components/Common/CloseIcon'
import { ButtonsContainer, FormBase } from '../components/Common/FormBase'
import FormButton from '../components/Common/FormButton'

const DeleteComponentDialogBoxHeader = styled(DialogHeader)`
    position: relative;
    color: black;
    background: #ff4437;
    background-repeat: no-repeat;
    cursor: move;
    ${fonts.regular16}

    span {
        width: 380px;
        overflow: hidden;
        text-wrap: nowrap;
        text-overflow: ellipsis;
    }
`

const DeleteComponentForm = styled(FormBase)`
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
const DeleteComponentDialogBox = ({
    jobNo,
    componentData,
    onClose,
    setRestoreTableFocus,
}) => {
    const { componentsList, onComponentDelete } = useStore((state) => ({
        componentsList: state.componentsList,
        onComponentDelete: state.onComponentDelete,
    }))
    const dialogRef = useRef(null)
    const headerRef = useRef(null)

    const findAssociatedCableComponents = (componentName, componentsList) => {
        const termName = componentName + ' Term'
        const testName = componentName + ' Test'

        const associatedComponents = componentsList.filter(
            (component) =>
                component.Name === termName || component.Name === testName
        )

        return associatedComponents
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault()
        if (!componentData) {
            toast.error('No component data available.')
            return
        }

        const rowIndex = componentsList.findIndex(
            (c) => c.ID === componentData.ID
        )
        if (rowIndex === -1) return

        // Handle deletion of associated components if it's a CBS component
        if (componentData.Code === 'cbs') {
            const associatedComponents = findAssociatedCableComponents(
                componentData.Name,
                componentsList
            )

            for (const associatedComponent of associatedComponents) {
                const result = await onComponentDelete(
                    jobNo,
                    associatedComponent.ID
                )
                if (!result.success) {
                    toast.error(
                        `Failed to delete associated component with ID: ${associatedComponent.ID}`
                    )
                    return
                }
            }
        }

        // Delete the main component
        const result = await onComponentDelete(jobNo, componentData.ID)
        if (result.success) {
            toast.success('Component successfully deleted!')
            onClose()

            const previousRowIndex = Math.max(0, rowIndex - 1)
            setRestoreTableFocus({
                rowIndex: previousRowIndex,
                column: 'Name',
            })
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
            <DeleteComponentDialogBoxHeader ref={headerRef}>
                Delete Component:
                <span>&#8203; {componentData.Name}</span>
                <CloseIcon $variant="black" onClose={onClose} />
            </DeleteComponentDialogBoxHeader>
            <DialogContent>
                <DeleteComponentForm onSubmit={handleFormSubmit}>
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
                        Are you sure you want to delete this Component?
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
                </DeleteComponentForm>
            </DialogContent>
        </DialogBoxContainer>
    )
}

DeleteComponentDialogBox.propTypes = {
    jobNo: PropTypes.string.isRequired,
    componentData: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    setRestoreTableFocus: PropTypes.func.isRequired,
}

export default DeleteComponentDialogBox
