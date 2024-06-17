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
