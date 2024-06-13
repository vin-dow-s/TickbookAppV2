import { componentsNamePattern, onlyFloatsPattern } from './regexPatterns'

export const componentValidators = {
    Name: (value) =>
        componentsNamePattern.test(value)
            ? ''
            : 'Name must be 3-180 characters long and contain no invalid character.',
    LabNorm: (value) =>
        onlyFloatsPattern.test(value) ? '' : 'Lab Norm must be a number.',
    LabUplift: (value) =>
        onlyFloatsPattern.test(value) ? '' : 'Lab Uplift must be a number.',
    MatNorm: (value) =>
        onlyFloatsPattern.test(value) ? '' : 'Mat Norm must be a number.',
    SubConCost: (value) =>
        onlyFloatsPattern.test(value) ? '' : 'S/C Cost must be a number.',
    SubConNorm: (value) =>
        onlyFloatsPattern.test(value) ? '' : 'S/C Norm must be a number.',
    PlantCost: (value) =>
        onlyFloatsPattern.test(value) ? '' : 'Plant Cost must be a number.',
    GlandNorm: (value) =>
        onlyFloatsPattern.test(value) ? '' : 'must be a number.',
    TestNorm: (value) =>
        onlyFloatsPattern.test(value) ? '' : 'must be a number.',
}

export const validateField = (validators, fieldName, value) => {
    value = value.trim()

    if (validators[fieldName]) {
        return validators[fieldName](value)
    }
    return ''
}

export const validateFormFields = (
    e,
    fieldNames,
    validators,
    setIsValid,
    setFieldErrors
) => {
    let hasErrors = false
    let newIsValid = {}
    let newFieldErrors = {}
    let fieldValues = {}

    for (let fieldName of fieldNames) {
        const fieldValue = e.target.elements[fieldName].value
        fieldValues[fieldName] = fieldValue

        const errorMessage = validateField(validators, fieldName, fieldValue)

        newIsValid[fieldName] = !errorMessage
        newFieldErrors[fieldName] = errorMessage

        if (errorMessage) hasErrors = true
    }

    setIsValid(newIsValid)
    setFieldErrors(newFieldErrors)
    return { isValid: !hasErrors, fieldValues }
}

export const getClassForField = (field, fieldErrors, fieldValues) => {
    if (fieldErrors[field]) return 'invalid'
    if (fieldValues[field]) return 'valid'
    return ''
}
