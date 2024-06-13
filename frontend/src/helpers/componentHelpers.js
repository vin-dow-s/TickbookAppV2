// componentHelpers.js
import { toast } from 'react-toastify'
import {
    validateFormFields,
    getClassForField,
} from '../utils/validationFormFields'

export const fieldClasses = (fieldErrors, fieldValues) => ({
    Code: getClassForField('Code', fieldErrors, fieldValues),
    Name: getClassForField('Name', fieldErrors, fieldValues),
    LabNorm: getClassForField('LabNorm', fieldErrors, fieldValues),
    LabUplift: getClassForField('LabUplift', fieldErrors, fieldValues),
    MatNorm: getClassForField('MatNorm', fieldErrors, fieldValues),
    SubConCost: getClassForField('SubConCost', fieldErrors, fieldValues),
    SubConNorm: getClassForField('SubConNorm', fieldErrors, fieldValues),
    PlantCost: getClassForField('PlantCost', fieldErrors, fieldValues),
    GlandNorm: getClassForField('GlandNorm', fieldErrors, fieldValues),
    TestNorm: getClassForField('TestNorm', fieldErrors, fieldValues),
})

export const validateComponentFields = (
    e,
    fieldNames,
    validators,
    setIsValid,
    setFieldErrors,
    fieldValues
) => {
    const additionalContext = { code: fieldValues.Code }

    // Modify the fieldNames array to exclude GlandNorm and TestNorm unless the code is 'cbs'
    const modifiedFieldNames = fieldNames.filter((fieldName) => {
        if (fieldName === 'GlandNorm' || fieldName === 'TestNorm') {
            return additionalContext.code === 'cbs'
        }
        return true
    })

    return validateFormFields(
        e,
        modifiedFieldNames,
        validators,
        setIsValid,
        setFieldErrors,
        additionalContext
    ).isValid
}

export const normalizeNumericFields = (values) => ({
    ...values,
    LabNorm: parseFloat(values.LabNorm) || 0,
    LabUplift: parseFloat(values.LabUplift) || 0,
    MatNorm: parseFloat(values.MatNorm) || 0,
    SubConCost: parseFloat(values.SubConCost) || 0,
    SubConNorm: parseFloat(values.SubConNorm) || 0,
    PlantCost: parseFloat(values.PlantCost) || 0,
    GlandNorm: parseFloat(values.GlandNorm) || 0,
    TestNorm: parseFloat(values.TestNorm) || 0,
})

export const createCbsComponents = async (
    jobNo,
    baseComponentData,
    fieldValues,
    componentsList,
    onComponentCreate
) => {
    if (!isComponentNameUnique(fieldValues.Name, componentsList)) {
        toast.error('The Name of a cbs Component must be unique.')
        return false
    }

    const baseResult = await onComponentCreate(jobNo, baseComponentData)
    if (!baseResult.success) {
        toast.error('Error creating the base Component.')
        return false
    }

    const termComponent = {
        ...baseComponentData,
        Name: baseComponentData.Name + ' Term',
        LabNorm: baseComponentData.GlandNorm,
    }
    const termResult = await onComponentCreate(jobNo, termComponent)
    if (!termResult.success) {
        toast.error('Error creating the Term Component.')
        return false
    }

    const testComponent = {
        ...baseComponentData,
        Name: baseComponentData.Name + ' Test',
        LabNorm: baseComponentData.TestNorm,
    }
    const testResult = await onComponentCreate(jobNo, testComponent)
    if (!testResult.success) {
        toast.error('Error creating the Test Component.')
        return false
    }

    toast.success('Components successfully created.')
    return true
}

export const isComponentNameUnique = (name, componentsList) => {
    return !componentsList.some((component) => component.Name === name)
}

export const isNameUsedByCbsComponent = (name, componentsList) => {
    return componentsList.some(
        (component) => component.Name === name && component.Code === 'cbs'
    )
}
