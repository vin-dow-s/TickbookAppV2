export const validateField = (
    validators,
    fieldName,
    value,
    additionalContext = {}
) => {
    value = value.trim()

    if (fieldName === 'GlandNorm' || fieldName === 'TestNorm') {
        if (additionalContext.code === 'cbs') {
            return validators[fieldName] ? validators[fieldName](value) : ''
        }
        return '' // Skip validation for these fields unless the code is 'cbs'
    }

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
    setFieldErrors,
    additionalContext = {}
) => {
    let hasErrors = false
    let newIsValid = {}
    let newFieldErrors = {}
    let fieldValues = {}

    for (let fieldName of fieldNames) {
        const fieldValue = e.target.elements[fieldName].value
        fieldValues[fieldName] = fieldValue

        const errorMessage = validateField(
            validators,
            fieldName,
            fieldValue,
            additionalContext
        )

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
