//Modules
import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'

//Hooks
import useStore from '../hooks/useStore'

//Utils
import {
    equipmentDescriptionPattern,
    equipmentSectionPattern,
    equipmentRefPattern,
    equipmentAreaPattern,
    equipmentTendSectionPattern,
} from '../utils/regexPatterns'
import {
    getClassForField,
    validateField,
    validateFormFields,
} from '../utils/validationFormFields'

//Styles and constants
import {
    DialogBoxContainer,
    DialogContent,
    DialogHeader,
} from '../styles/dialog-boxes'
import { colors, fonts } from '../styles/global-styles'

//Components
import CloseIcon from '../components/Common/CloseIcon'
import {
    ButtonsContainer,
    ErrorMessage,
    FieldsContainer,
    FormBase,
    FormField,
    LabelInputContainer,
} from '../components/Common/FormBase'
import FormButton from '../components/Common/FormButton'

//Styled components declarations
const EditEquipmentDialogBoxContainer = styled(DialogBoxContainer)`
    width: 90%;
    min-width: 40em;
    max-width: 60em;
    background-color: ${colors.mainFrameBackground};
`

const EditDetailsEquipmentDialogBoxHeader = styled(DialogHeader)`
    position: relative;
    color: black;
    background: ${colors.lightBlueBgenTransparent};
    background-repeat: no-repeat;
    cursor: move;
    ${fonts.regular16}
`

const EditEquipmentDialogBoxContent = styled(DialogContent)`
    padding: 25px 50px;
`

const EditEquipmentForm = styled(FormBase)`
    position: relative;
    align-items: center;
    margin-top: 5px;
    padding: 0 25px;
`

const FieldsWrapper = styled.div`
    display: flex;
    flex-direction: row;
`

const EditEquipmentFieldsContainer = styled(FieldsContainer)`
    flex-direction: column;
`

const RowContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;

    &.full-width {
        width: 100%;
    }
`

const EditEquipmentFormField = styled(FormField)`
    position: relative;
    flex-direction: column;
    align-items: flex-start;

    label {
        display: flex;
        flex-direction: row;
    }

    .tendSection input,
    .currentRevision input,
    input {
        width: 100%;
    }

    &.currentRevision {
        width: 30%;
    }

    &.section,
    &.area {
        width: 35%;
    }

    &.tendSection {
        width: 30%;
    }

    &.ref {
        width: 30%;
    }

    &.description {
        width: 70%;
    }
`

//Main component of the file
const EditEquipmentDialogBox = ({
    jobNo,
    equipmentData,
    onClose,
    updateDashboardTablesAndSummary,
}) => {
    // 1. State declarations
    const { templatesList, fetchTemplatesList, onEquipmentUpdate } = useStore(
        (state) => ({
            templatesList: state.templatesList,
            fetchTemplatesList: state.fetchTemplatesList,
            onEquipmentUpdate: state.onEquipmentUpdate,
        })
    )

    const DEFAULT_VALUES = {
        Ref: equipmentData.Ref,
        Description: equipmentData.Description,
        Template: equipmentData.Template,
        Section: equipmentData.Section,
        Area: equipmentData.Area,
        TendSection: equipmentData.TendSection || 't.b.a',
        CurrentRevision: 't.b.a',
    }
    const [, setIsValid] = useState({
        Ref: false,
        Description: false,
        Template: false,
        Section: false,
        Area: false,
        TendSection: false,
        CurrentRevision: false,
    })
    const [fieldErrors, setFieldErrors] = useState({
        Ref: '',
        Description: '',
        Template: '',
        Section: '',
        Area: '',
        TendSection: '',
        CurrentRevision: '',
    })
    const [fieldValues, setFieldValues] = useState(DEFAULT_VALUES)
    const fieldNames = [
        'Ref',
        'Description',
        'Template',
        'Section',
        'Area',
        'TendSection',
        'CurrentRevision',
    ]

    const dialogRef = useRef(null)
    const headerRef = useRef(null)

    // 2. Helper Functions
    const validators = {
        Ref: (value) =>
            equipmentRefPattern.test(value)
                ? ''
                : 'Ref should be at least 3 characters long.',
        Description: (value) =>
            equipmentDescriptionPattern.test(value)
                ? ''
                : 'Description should be at least 3 characters long.',
        Section: (value) =>
            equipmentSectionPattern.test(value)
                ? ''
                : 'Section should be 3-20 characters long.',
        Area: (value) =>
            equipmentAreaPattern.test(value)
                ? ''
                : 'Area should be 3-25 characters long.',
        TendSection: (value) =>
            equipmentTendSectionPattern.test(value)
                ? ''
                : 'Tender Section should be a number.',
    }

    const fieldClasses = {
        Ref: getClassForField('Ref', fieldErrors, fieldValues),
        Description: getClassForField('Description', fieldErrors, fieldValues),
        Section: getClassForField('Section', fieldErrors, fieldValues),
        Area: getClassForField('Area', fieldErrors, fieldValues),
        TendSection: getClassForField('TendSection', fieldErrors, fieldValues),
        CurrentRevision: getClassForField(
            'TendSection',
            fieldErrors,
            fieldValues
        ),
    }

    // 3. Event handlers
    const handleInputChange = (e) => {
        const { id, value } = e.target
        setFieldValues((prevValues) => ({ ...prevValues, [id]: value }))

        const errorMessage = validateField(validators, id, value)
        setFieldErrors((prevErrors) => ({ ...prevErrors, [id]: errorMessage }))
    }

    //FORM submit: UPDATE
    const handleFormSubmit = async (e) => {
        e.preventDefault()

        if (!equipmentData) {
            toast.error('No equipment equipmentData available.')
            return
        }

        const { Ref } = equipmentData

        const { isValid, fieldValues: validatedFieldValues } =
            validateFormFields(
                e,
                fieldNames,
                validators,
                setIsValid,
                setFieldErrors
            )

        if (!isValid) return

        await onEquipmentUpdate(jobNo, Ref, validatedFieldValues)
        updateDashboardTablesAndSummary(validatedFieldValues, 'full-refresh')

        onClose()
    }

    //Click on button Cancel
    const handleCancelClick = () => {
        setIsValid({
            Ref: null,
            Description: null,
            Template: null,
            Section: null,
            Area: null,
            TendSection: null,
            CurrentRevision: null,
        })
        setFieldValues(DEFAULT_VALUES)
        setFieldErrors({})
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

    useEffect(() => {
        fetchTemplatesList(jobNo)
    }, [jobNo, fetchTemplatesList])

    useEffect(() => {
        setFieldValues({
            Ref: equipmentData.Ref,
            Description: equipmentData.Description,
            Template: equipmentData.Template,
            Section: equipmentData.Section,
            Area: equipmentData.Area,
            TendSection: equipmentData.TendSection || 't.b.a',
            CurrentRevision: 't.b.a',
        })
    }, [equipmentData])

    return (
        <EditEquipmentDialogBoxContainer ref={dialogRef}>
            <EditDetailsEquipmentDialogBoxHeader ref={headerRef}>
                {`Edit Equip Ref: ${equipmentData.Ref}`}
                <CloseIcon $variant="black" onClose={onClose} />
            </EditDetailsEquipmentDialogBoxHeader>
            <EditEquipmentDialogBoxContent>
                <EditEquipmentForm onSubmit={handleFormSubmit}>
                    <FieldsWrapper>
                        <EditEquipmentFieldsContainer>
                            <RowContainer>
                                <EditEquipmentFormField className="ref">
                                    <LabelInputContainer>
                                        <label htmlFor="Ref">Ref</label>
                                        <input
                                            id="Ref"
                                            value={fieldValues.Ref}
                                            onChange={handleInputChange}
                                            className={fieldClasses.Ref}
                                            type="text"
                                            placeholder="Max. 80 characters"
                                            maxLength={80}
                                        />
                                    </LabelInputContainer>
                                    {fieldErrors['Ref'] && (
                                        <ErrorMessage>
                                            {fieldErrors['Ref']}
                                        </ErrorMessage>
                                    )}
                                </EditEquipmentFormField>
                                <EditEquipmentFormField className="description">
                                    <LabelInputContainer>
                                        <label htmlFor="Description">
                                            Description
                                        </label>
                                        <input
                                            id="Description"
                                            value={fieldValues.Description}
                                            onChange={handleInputChange}
                                            className={fieldClasses.Description}
                                            type="text"
                                            placeholder="Max. 80 characters"
                                            maxLength={80}
                                        />
                                    </LabelInputContainer>
                                    {fieldErrors['Description'] && (
                                        <ErrorMessage>
                                            {fieldErrors['Description']}
                                        </ErrorMessage>
                                    )}
                                </EditEquipmentFormField>
                            </RowContainer>
                            <RowContainer>
                                <EditEquipmentFormField className="section">
                                    <LabelInputContainer>
                                        <label htmlFor="Section">Section</label>
                                        <input
                                            id="Section"
                                            value={fieldValues.Section}
                                            onChange={handleInputChange}
                                            className={fieldClasses.Section}
                                            type="text"
                                            placeholder="Max. 20 characters"
                                            maxLength={20}
                                        />
                                    </LabelInputContainer>
                                    {fieldErrors['Section'] && (
                                        <ErrorMessage>
                                            {fieldErrors['Section']}
                                        </ErrorMessage>
                                    )}
                                </EditEquipmentFormField>
                                <EditEquipmentFormField className="area">
                                    <LabelInputContainer>
                                        <label htmlFor="Area">Area</label>
                                        <input
                                            id="Area"
                                            value={fieldValues.Area}
                                            onChange={handleInputChange}
                                            className={fieldClasses.Area}
                                            type="text"
                                            placeholder="Max. 25 characters"
                                            maxLength={25}
                                        />
                                    </LabelInputContainer>
                                    {fieldErrors['Area'] && (
                                        <ErrorMessage>
                                            {fieldErrors['Area']}
                                        </ErrorMessage>
                                    )}
                                </EditEquipmentFormField>
                                <EditEquipmentFormField className="tendSection">
                                    <LabelInputContainer>
                                        <label htmlFor="TendSection">
                                            Tender Section
                                        </label>
                                        <input
                                            id="TendSection"
                                            value={fieldValues.TendSection}
                                            onChange={handleInputChange}
                                            className={fieldClasses.TendSection}
                                            type="text"
                                            placeholder="Ex: 1.01"
                                            maxLength={25}
                                        />
                                    </LabelInputContainer>
                                    {fieldErrors['TendSection'] && (
                                        <ErrorMessage>
                                            {fieldErrors['TendSection']}
                                        </ErrorMessage>
                                    )}
                                </EditEquipmentFormField>
                            </RowContainer>
                            <RowContainer>
                                <EditEquipmentFormField>
                                    <LabelInputContainer>
                                        <label htmlFor="Template">
                                            Template
                                        </label>
                                        <select
                                            id="Template"
                                            value={fieldValues.Template}
                                            onChange={handleInputChange}
                                            className={fieldClasses.Template}
                                        >
                                            {templatesList.map(
                                                (templateItem) => (
                                                    <option
                                                        key={templateItem.Name}
                                                        value={
                                                            templateItem.Name
                                                        }
                                                    >
                                                        {templateItem.Name}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </LabelInputContainer>
                                    {fieldErrors['Template'] && (
                                        <ErrorMessage>
                                            {fieldErrors['Template']}
                                        </ErrorMessage>
                                    )}
                                </EditEquipmentFormField>
                                <EditEquipmentFormField className="currentRevision">
                                    <LabelInputContainer>
                                        <label htmlFor="CurrentRevision">
                                            Current Revision
                                        </label>
                                        <input
                                            id="CurrentRevision"
                                            value={fieldValues.CurrentRevision}
                                            onChange={handleInputChange}
                                            className={
                                                fieldClasses.CurrentRevision
                                            }
                                            type="text"
                                            placeholder="Ex: A1"
                                            maxLength={5}
                                        />
                                    </LabelInputContainer>
                                    {fieldErrors['CurrentRevision'] && (
                                        <ErrorMessage>
                                            {fieldErrors['CurrentRevision']}
                                        </ErrorMessage>
                                    )}
                                </EditEquipmentFormField>
                            </RowContainer>
                        </EditEquipmentFieldsContainer>
                    </FieldsWrapper>

                    <ButtonsContainer>
                        <FormButton type="submit" variant="submit">
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
                </EditEquipmentForm>
            </EditEquipmentDialogBoxContent>
        </EditEquipmentDialogBoxContainer>
    )
}

EditEquipmentDialogBox.propTypes = {
    jobNo: PropTypes.string,
    equipmentData: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    updateDashboardTablesAndSummary: PropTypes.func.isRequired,
}

export default EditEquipmentDialogBox
