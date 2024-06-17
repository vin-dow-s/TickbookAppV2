import { toast } from 'react-toastify'
import {
    equipmentAreaPattern,
    equipmentCurrentRevisionPattern,
    equipmentDescriptionPattern,
    equipmentRefPattern,
    equipmentSectionPattern,
    equipmentTendSectionPattern,
    templatesNamePattern,
} from '../utils/regexPatterns'
import { getClassForField } from '../utils/validationFormFields'

export const equipmentValidators = {
    Ref: (value) =>
        equipmentRefPattern.test(value)
            ? ''
            : 'Reference should be at least 3 characters long.',
    Description: (value) =>
        equipmentDescriptionPattern.test(value)
            ? ''
            : 'Description should be 3-80 characters long.',
    Section: (value) =>
        equipmentSectionPattern.test(value)
            ? ''
            : 'Section should be 3-20 characters long.',
    Area: (value) =>
        equipmentAreaPattern.test(value)
            ? ''
            : 'Area should be 3-25 characters long.',
    Revision: (value) =>
        equipmentCurrentRevisionPattern.test(value)
            ? ''
            : 'Revision must be 1-5 characters long.',
}

export const fieldClasses = (fieldErrors, fieldValues) => ({
    Ref: getClassForField('Ref', fieldErrors, fieldValues),
    Description: getClassForField('Description', fieldErrors, fieldValues),
    Section: getClassForField('Section', fieldErrors, fieldValues),
    Area: getClassForField('Area', fieldErrors, fieldValues),
    Template: getClassForField('Template', fieldErrors, fieldValues),
    CurrentRevision: getClassForField(
        'CurrentRevision',
        fieldErrors,
        fieldValues
    ),
})

export const validateEquipmentFileData = (jsonData, templatesList) => {
    let missingValues = []
    let invalidRefFormat = []
    let invalidDescriptionFormat = []
    let invalidSectionFormat = []
    let invalidAreaFormat = []
    let invalidTemplateFormat = []
    let invalidTenderSectionFormat = []
    let errorMessages = []
    let equipList = []

    const existingTemplatesSet = new Set(
        templatesList.map((template) => template.Name)
    )
    let nonExistentTemplates = new Set()

    try {
        jsonData.forEach((row, index) => {
            // Trim all string fields
            Object.keys(row).forEach((key) => {
                if (typeof row[key] === 'string') {
                    row[key] = row[key].trim()
                }
            })

            // Check for missing values and test regex patterns
            if (
                !row.Ref ||
                !row.Description ||
                !row.Template ||
                !row.Section ||
                !row.Area
            ) {
                missingValues.push(index + 2)
            } else if (!equipmentRefPattern.test(row.Ref)) {
                invalidRefFormat.push(index + 2)
            } else if (!equipmentDescriptionPattern.test(row.Description)) {
                invalidDescriptionFormat.push(index + 2)
            } else if (!equipmentSectionPattern.test(row.Section)) {
                invalidSectionFormat.push(index + 2)
            } else if (!equipmentAreaPattern.test(row.Area)) {
                invalidAreaFormat.push(index + 2)
            } else if (!templatesNamePattern.test(row.Template)) {
                invalidTemplateFormat.push(index + 2)
            } else if (
                row.TenderSection &&
                !equipmentTendSectionPattern.test(row.TenderSection)
            ) {
                invalidTenderSectionFormat.push(index + 2)
            } else {
                equipList.push(row)
            }

            if (!existingTemplatesSet.has(row.Template)) {
                nonExistentTemplates.add(row.Template)
            }
        })

        // Compile error messages
        if (missingValues.length > 0) {
            errorMessages.push(
                `missing values on lines ${missingValues.join(', ')}`
            )
        }
        if (invalidRefFormat.length > 0) {
            errorMessages.push(
                `invalid Ref on lines ${invalidRefFormat.join(', ')}`
            )
        }
        if (invalidDescriptionFormat.length > 0) {
            errorMessages.push(
                `invalid Description on lines ${invalidDescriptionFormat.join(
                    ', '
                )}`
            )
        }
        if (invalidSectionFormat.length > 0) {
            errorMessages.push(
                `invalid Section on lines ${invalidSectionFormat.join(', ')}`
            )
        }
        if (invalidAreaFormat.length > 0) {
            errorMessages.push(
                `invalid Area on lines ${invalidAreaFormat.join(', ')}`
            )
        }
        if (invalidTemplateFormat.length > 0) {
            errorMessages.push(
                `invalid Template on lines ${invalidTemplateFormat.join(', ')}`
            )
        }
        if (invalidTenderSectionFormat.length > 0) {
            errorMessages.push(
                `invalid TenderSection on lines ${invalidTenderSectionFormat.join(
                    ', '
                )}`
            )
        }
    } catch (error) {
        return { equipList: [], nonExistentTemplates: [] }
    }

    return {
        equipList,
        errorMessages,
        nonExistentTemplates: Array.from(nonExistentTemplates),
    }
}

export const displayToastMessagesOnFileUpload = (
    uniqueEquipmentCount,
    successCount,
    failureCount,
    errorMessages,
    equipmentAlreadyExisting,
    nonExistentTemplates
) => {
    toast.info(`Processed ${uniqueEquipmentCount} lines.`)
    if (successCount > 0) toast.success(`Created ${successCount} Equipment.`)
    if (successCount === 0 && failureCount === 0 && errorMessages.length === 0)
        toast.warning(`No new Equipment to create.`)
    if (failureCount > 0) {
        toast.error(
            `${failureCount} lines failed, please check your Excel file.`
        )
    }
    if (errorMessages.length > 0) {
        toast.error(
            `Some items have not been created because of the following errors: ${errorMessages.join(
                '; '
            )}.`
        )
    }
    if (nonExistentTemplates > 0) {
        toast.error(`${nonExistentTemplates} non-existent Templates found.`)
    }
    if (
        (equipmentAlreadyExisting.length > 0 && successCount > 0) ||
        failureCount > 0 ||
        errorMessages.length > 0
    ) {
        toast.warning(
            `The following Refs already exist: ${equipmentAlreadyExisting.join(
                ', '
            )}.`
        )
    }
}
