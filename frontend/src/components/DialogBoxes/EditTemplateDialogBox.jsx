//Modules
import PropTypes from 'prop-types'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'

//Styles and constants
import {
    DialogBoxContainer,
    DialogContent,
    DialogHeader,
} from '../../styles/dialog-boxes'
import { colors } from '../../styles/global-styles'
import { StyledAGGrid } from '../../styles/ag-grid'
import { columnsComponentsInProject } from '../../constants/ag-grid-columns'

//Assets
import ArrowDown from '../../assets/arrow-down-line.svg'
import ArrowUp from '../../assets/arrow-up-line.svg'

//Components
import CloseIcon from '../../components/Common/CloseIcon'
import { ButtonsContainer, FormField } from '../../components/Common/FormBase'
import FormButton from '../../components/Common/FormButton'
import { overlayLoadingTemplatePurple } from '../../components/Common/Loader'
import useStore from '../../hooks/useStore'

//Styled components declarations
const EditTemplateDialogBoxContainer = styled(DialogBoxContainer)`
    width: 98%;
    min-width: 60em;
    max-width: 70em;
    max-height: 99%;
    background-color: ${colors.mainFrameBackground};
`

const EditTemplateDialogBoxContent = styled(DialogContent)`
    padding: 25px;

    label {
        margin-bottom: 5px;
    }
`

const EditTemplateForm = styled(FormField)`
    position: relative;
    flex-direction: row;
    align-items: flex-start;
    margin: 10px 15px 0 15px;

    label {
        display: flex;
        flex-direction: row;
    }

    input {
        width: max-content;
        margin-bottom: 5px;
    }

    .disabled-code {
        color: ${colors.tablesBorders};
    }

    .codeName {
        position: absolute;
        width: 300px;
        top: 45px;
        font-size: smaller;
        color: ${colors.purpleBgenDarker};
    }

    .wholeEstimate {
        align-self: center;
        align-items: center;
    }
`

const FieldsWrapper = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    width: 100%;
`

const TemplatesAndComponentsContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: row;
    flex: 1;
    gap: 25px;
    width: 100%;
    margin-bottom: 25px;

    label {
        top: 45px;
        font-size: small;
        font-style: italic;
        color: ${colors.purpleBgenDarker};
    }
`

const ComponentsWrapper = styled.div`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-width: 28em;
`

const SelectedComponentsWrapper = styled.div`
    display: flex;
    flex-direction: column;
    flex-grow: 0;
    height: 100%;
    max-height: calc(39vh - 35px);
    height: calc(39vh - 35px);
    border-radius: 5px;
    overflow-y: auto;
    overflow-x: hidden;
    border: 1px dashed ${colors.tablesBorders};
    scroll-behavior: smooth;
`

const SelectComponentMessage = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0;
    color: darkgray;
    text-align: center;

    .file-content {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-top: 10px;
    }

    .file-loaded-indicator {
        margin-top: 10px;
        text-align: center;
        font-style: italic;
        font-size: smaller;
        color: rgba(0, 0, 0, 0.5);
    }
`

const SelectedComponentRow = styled.div`
    display: flex;
    padding: 5px;
    margin: 0;
    justify-content: space-between;
    overflow: hidden;
    opacity: 1;
    flex-shrink: 0;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.15s, transform 0.15s ease-in;
    transform: translateY(-10px);

    ${(props) =>
        props.$animationstate === 'entering' &&
        `
        max-height: 0;
        transform: translateY(-10px);
        opacity: 0;
    `}

    ${(props) =>
        props.$animationstate === 'entered' &&
        `
        max-height: 55px;
        transform: translateY(0);
        opacity: 1;
    `}

    ${(props) =>
        props.$animationstate === 'exiting' &&
        `
        transform: translateX(50%);
        opacity: 0;
        transition: all 0.3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
    `}

    span {
        transition: all 0.3s, transform 0.3s ease-in;

        &:hover {
            color: #e74c3c;
        }
    }

    img {
        border: 1px solid ${colors.darkBlueBgenTransparent};
        border-radius: 25px;
        height: 15px;
        max-height: 15px;
        justify-content: right;
    }
`

const ClearAllButton = styled.button`
    background-color: white;
    color: ${colors.purpleBgen};
    border: 1px solid ${colors.purpleBgen};
    border-radius: 5px;
    padding: 5px 15px;
    height: 28px;
    margin-top: 5px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
        color: #e74c3c;
        border-color: #e74c3c;
    }
`

//Main component of the file
const EditTemplateDialogBox = ({
    jobNo,
    componentsInTemplate,
    nonCbsComponentsInProject,
    onClose,
    updateTemplatesTable,
}) => {
    const { onTemplateUpdate } = useStore((state) => ({
        onTemplateUpdate: state.onTemplateUpdate,
    }))

    //Convert templateData to the format of manually selected components and add a unique ID
    const normalizedTemplateData = useMemo(
        () =>
            componentsInTemplate.map((templateComponent, index) => {
                const fullComponentData = nonCbsComponentsInProject.find(
                    (comp) => comp.ID === templateComponent.Component_ID
                )

                return {
                    ...templateComponent,
                    ...fullComponentData,
                    uid: `initial-${index}`,
                }
            }),
        [componentsInTemplate, nonCbsComponentsInProject]
    )

    const template = componentsInTemplate[0]?.Name

    //1. State declarations
    const [
        nonCbsComponentsInProjectTableGridApi,
        setNonCbsComponentsInProjectTableGridApi,
    ] = useState(null)
    const [selectedComponents, setSelectedComponents] = useState(
        normalizedTemplateData
    )
    const [componentAnimations, setComponentAnimations] = useState({})
    const [componentAdded, setComponentAdded] = useState(false)
    const selectedComponentsWrapperRef = useRef(null)

    const dialogRef = useRef(null)
    const headerRef = useRef(null)

    //Updates selectedComponents on click in "Components in Project"
    const handleComponentSelect = (event) => {
        const clickedComponent = event.data
        const componentExistsInSelected = selectedComponents.some(
            (component) =>
                component.ID === clickedComponent.ID &&
                component.uid.startsWith('uid-')
        )

        if (componentExistsInSelected) {
            setSelectedComponents((prevComponents) =>
                prevComponents.filter(
                    (component) =>
                        !(
                            component.ID === clickedComponent.ID &&
                            component.uid.startsWith('uid-')
                        )
                )
            )
        } else {
            setSelectedComponents((prevComponents) => [
                ...prevComponents,
                {
                    ...clickedComponent,
                    uid: `uid-${Date.now()}-${clickedComponent.ID}`,
                },
            ])
        }
    }

    const nonCbsComponentsInProjectTableGridOptions = {
        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true,
        },
        columnDefs: columnsComponentsInProject,
        rowSelection: 'single',
        overlayLoadingTemplate: overlayLoadingTemplatePurple,
        onGridReady: (params) => {
            setNonCbsComponentsInProjectTableGridApi(params.api)
            params.api.updateGridOptions({ rowData: nonCbsComponentsInProject })
        },
        onRowClicked: handleComponentSelect,
    }

    //2. Event handlers
    //Updates selectedComponents on click in "Selected Components"
    const handleComponentDeselect = (component) => {
        setComponentAnimations((prevAnimations) => ({
            ...prevAnimations,
            [component.uid]: 'exiting',
        }))

        setTimeout(() => {
            setSelectedComponents((prevComponents) =>
                prevComponents.filter((comp) => comp.uid !== component.uid)
            )
            setComponentAnimations((prevAnimations) => {
                const updatedAnimations = { ...prevAnimations }
                delete updatedAnimations[component.uid]
                return updatedAnimations
            })
        }, 300)
    }

    //Clears selectedComponents
    const handleClearAll = () => {
        setComponentAnimations({})
        setSelectedComponents([])
    }

    //FORM submit (here, UPDATE only)
    const handleFormSubmit = async (e) => {
        e.preventDefault()

        if (selectedComponents.length === 0) {
            toast.info(
                'Please select at least one Component to edit the Template.'
            )
            return
        }

        const result = await onTemplateUpdate(
            jobNo,
            template,
            selectedComponents
        )

        if (result.success) {
            toast.success('Template successfully updated.')
            updateTemplatesTable(result.template)
            onClose()
        } else {
            toast.error(`Error: ${result.error}`)
        }
    }

    //Click on button Cancel
    const handleCancelClick = () => {
        setSelectedComponents(normalizedTemplateData)
    }

    //Moves a Component up in the list
    const moveComponentUp = (index) => {
        if (index === 0) return
        setSelectedComponents((prevComponents) => {
            const newComponents = [...prevComponents]
            ;[newComponents[index - 1], newComponents[index]] = [
                newComponents[index],
                newComponents[index - 1],
            ]
            return newComponents
        })
    }

    //Moves a Component down in the list
    const moveComponentDown = (index) => {
        if (index === selectedComponents.length - 1) return
        setSelectedComponents((prevComponents) => {
            const newComponents = [...prevComponents]
            ;[newComponents[index], newComponents[index + 1]] = [
                newComponents[index + 1],
                newComponents[index],
            ]
            return newComponents
        })
    }

    //3. useEffects
    useEffect(() => {
        if (nonCbsComponentsInProjectTableGridApi) {
            nonCbsComponentsInProjectTableGridApi.updateGridOptions({
                rowData: nonCbsComponentsInProject,
            })
        }
    }, [nonCbsComponentsInProject, nonCbsComponentsInProjectTableGridApi])

    useEffect(() => {
        if (selectedComponentsWrapperRef.current && componentAdded) {
            const element = selectedComponentsWrapperRef.current
            element.scrollTop = element.scrollHeight
            setComponentAdded(false)
        }
    }, [componentAdded])

    useEffect(() => {
        setSelectedComponents(normalizedTemplateData)
    }, [normalizedTemplateData])

    useEffect(() => {
        setComponentAnimations((prevAnimations) => {
            const newAnimations = { ...prevAnimations }

            selectedComponents.forEach((component) => {
                if (!newAnimations[component.uid]) {
                    newAnimations[component.uid] = 'entering'
                }
            })

            Object.keys(newAnimations).forEach((key) => {
                if (newAnimations[key] === 'entering') {
                    newAnimations[key] = 'entered'
                }
            })

            return newAnimations
        })
    }, [selectedComponents])

    useEffect(() => {
        if (selectedComponentsWrapperRef.current && componentAdded) {
            const element = selectedComponentsWrapperRef.current
            element.scrollTop = element.scrollHeight
            setComponentAdded(false)
        }
    }, [componentAdded])

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
        <EditTemplateDialogBoxContainer ref={dialogRef}>
            <DialogHeader ref={headerRef}>
                {`Edit Template: ${componentsInTemplate[0].Name}`}
                <CloseIcon $variant="black" onClose={onClose} />
            </DialogHeader>
            <EditTemplateDialogBoxContent>
                <EditTemplateForm>
                    <FieldsWrapper>
                        <TemplatesAndComponentsContainer>
                            <ComponentsWrapper>
                                <span className="grey-label left">
                                    Components List
                                </span>{' '}
                                <div
                                    style={{
                                        height: '100%',
                                        width: '100%',
                                    }}
                                >
                                    <StyledAGGrid
                                        className="ag-theme-quartz purple-table"
                                        gridOptions={
                                            nonCbsComponentsInProjectTableGridOptions
                                        }
                                        rowData={nonCbsComponentsInProject}
                                    />
                                </div>
                            </ComponentsWrapper>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="64"
                                height="64"
                                style={{
                                    alignSelf: 'center',
                                    paddingLeft: '5px',
                                }}
                            >
                                <path
                                    d="M13.1714 12.0007L8.22168 7.05093L9.63589 5.63672L15.9999 12.0007L9.63589 18.3646L8.22168 16.9504L13.1714 12.0007Z"
                                    fill="rgba(169,169,169,1)"
                                ></path>
                            </svg>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    flex: '1',
                                }}
                            >
                                <span className="grey-label left">
                                    Components in selected Template
                                </span>{' '}
                                <SelectedComponentsWrapper
                                    ref={selectedComponentsWrapperRef}
                                >
                                    {selectedComponents.length === 0 ? (
                                        <SelectComponentMessage>
                                            Select Components to edit the
                                            Template
                                        </SelectComponentMessage>
                                    ) : (
                                        <>
                                            {selectedComponents.map(
                                                (component, index) => {
                                                    const animationstate =
                                                        componentAnimations[
                                                            component.uid
                                                        ]

                                                    return (
                                                        <SelectedComponentRow
                                                            key={component.uid}
                                                            $animationstate={
                                                                animationstate
                                                            }
                                                        >
                                                            <span
                                                                onClick={() =>
                                                                    handleComponentDeselect(
                                                                        component
                                                                    )
                                                                }
                                                            >
                                                                {component.Component ||
                                                                    component.Name}{' '}
                                                                <span
                                                                    style={{
                                                                        fontStyle:
                                                                            'italic',
                                                                        color: 'grey',
                                                                    }}
                                                                >
                                                                    (
                                                                    {parseFloat(
                                                                        component.LabNorm.toFixed(
                                                                            3
                                                                        )
                                                                    )}
                                                                    )
                                                                </span>
                                                            </span>
                                                            <div
                                                                style={{
                                                                    display:
                                                                        'flex',
                                                                    flexDirection:
                                                                        'row',
                                                                }}
                                                            >
                                                                <img
                                                                    src={
                                                                        ArrowUp
                                                                    }
                                                                    alt="move up"
                                                                    onClick={() =>
                                                                        moveComponentUp(
                                                                            index
                                                                        )
                                                                    }
                                                                />

                                                                <img
                                                                    src={
                                                                        ArrowDown
                                                                    }
                                                                    alt="move down"
                                                                    onClick={() =>
                                                                        moveComponentDown(
                                                                            index
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        </SelectedComponentRow>
                                                    )
                                                }
                                            )}
                                        </>
                                    )}
                                </SelectedComponentsWrapper>
                                <ClearAllButton
                                    type="button"
                                    onClick={handleClearAll}
                                >
                                    Clear All
                                </ClearAllButton>
                            </div>
                        </TemplatesAndComponentsContainer>
                        <ButtonsContainer>
                            <FormButton
                                type="submit"
                                variant="submit"
                                onClick={handleFormSubmit}
                            >
                                Update
                            </FormButton>
                            <FormButton
                                type="reset"
                                variant="cancel"
                                onClick={handleCancelClick}
                            >
                                Cancel
                            </FormButton>
                        </ButtonsContainer>
                    </FieldsWrapper>
                </EditTemplateForm>
            </EditTemplateDialogBoxContent>
        </EditTemplateDialogBoxContainer>
    )
}

EditTemplateDialogBox.propTypes = {
    jobNo: PropTypes.string,
    componentsInTemplate: PropTypes.arrayOf(PropTypes.object).isRequired,
    nonCbsComponentsInProject: PropTypes.arrayOf(PropTypes.object),
    onClose: PropTypes.func.isRequired,
    updateTemplatesTable: PropTypes.func.isRequired,
}

export default EditTemplateDialogBox
