import { toast } from 'react-toastify'
import { getClassForField } from '../utils/validationFormFields'
import {
    componentsNamePattern,
    onlyFloatsPattern,
    templatesNamePattern,
} from '../utils/regexPatterns'

export const fieldClasses = (fieldErrors, fieldValues) => ({
    Name: getClassForField('Name', fieldErrors, fieldValues),
})

export const templateValidators = {
    Name: (value) =>
        templatesNamePattern.test(value)
            ? ''
            : 'should be between 3 and 80 characters long.',
}

export const validateTemplatesFileData = (jsonData) => {
    const missingValues = []
    const invalidComponentFormat = []
    const invalidLabNormFormat = []
    const invalidTemplateFormat = []
    const invalidEquipQtyFormat = []
    const errorMessages = []

    jsonData.forEach((row, index) => {
        Object.keys(row).forEach((key) => {
            if (typeof row[key] === 'string') {
                row[key] = row[key].trim()
            }
        })

        if (
            !row.Template ||
            !row.Component ||
            row.LabNorm === undefined ||
            row.EquipQty === undefined
        ) {
            missingValues.push(index + 2)
        } else if (!templatesNamePattern.test(row.Template)) {
            invalidTemplateFormat.push(index + 2)
        } else if (!componentsNamePattern.test(row.Component)) {
            invalidComponentFormat.push(index + 2)
        } else if (!onlyFloatsPattern.test(row.LabNorm.toString())) {
            invalidLabNormFormat.push(index + 2)
        } else if (!/^\d+$/.test(row.EquipQty.toString())) {
            invalidEquipQtyFormat.push(index + 2)
        }
    })

    if (missingValues.length > 0) {
        errorMessages.push(
            `Missing values on lines ${missingValues.join(', ')}`
        )
    }
    if (invalidComponentFormat.length > 0) {
        errorMessages.push(
            `Invalid Component name on lines ${invalidComponentFormat.join(
                ', '
            )}`
        )
    }
    if (invalidLabNormFormat.length > 0) {
        errorMessages.push(
            `Invalid LabNorm on lines ${invalidLabNormFormat.join(', ')}`
        )
    }
    if (invalidTemplateFormat.length > 0) {
        errorMessages.push(
            `Invalid Template name on lines ${invalidTemplateFormat.join(', ')}`
        )
    }
    if (invalidEquipQtyFormat.length > 0) {
        errorMessages.push(
            `Invalid EquipQty on lines ${invalidEquipQtyFormat.join(', ')}`
        )
    }

    return errorMessages
}

export const groupComponentsByTemplateAndReturnsComponentsToCreate = (
    jsonData,
    componentsInProject
) => {
    let componentsToCreate = []
    const templatesMap = new Map()
    const equipQtyConsistencyMap = new Map()
    const inconsistentTemplateEquipQty = new Set()

    jsonData.forEach((row) => {
        // Add to componentsToCreate if the component does not exist
        if (
            !componentsInProject.some(
                (comp) =>
                    comp.Name === row.Component && comp.LabNorm === row.LabNorm
            )
        ) {
            componentsToCreate.push({ ...row, LabNorm: row.LabNorm })
        }

        // Group components by Template Name
        const templateComponents = templatesMap.get(row.Template) || []
        templateComponents.push({
            component: row.Component,
            labNorm: row.LabNorm,
            equipQty: row.EquipQty,
            inOrder: row.InOrder,
            rowNum: row.__rowNum__,
        })
        templatesMap.set(row.Template, templateComponents)

        // Check EquipQty consistency
        if (equipQtyConsistencyMap.has(row.Template)) {
            if (equipQtyConsistencyMap.get(row.Template) !== row.EquipQty) {
                inconsistentTemplateEquipQty.add(row.Template)
            }
        } else {
            equipQtyConsistencyMap.set(row.Template, row.EquipQty)
        }
    })

    if (inconsistentTemplateEquipQty.size > 0) {
        return {
            error: `Inconsistent EquipQty found in Templates: ${Array.from(
                inconsistentTemplateEquipQty
            ).join(', ')}`,
        }
    }

    return {
        componentsToCreate,
        templatesMap,
        inconsistentTemplateEquipQty,
    }
}

export const deduplicateComponents = (components) => {
    const uniqueComponents = new Map()

    components.forEach((component) => {
        const uniqueKey = `${component.Component}-${component.LabNorm}`

        if (!uniqueComponents.has(uniqueKey)) {
            uniqueComponents.set(uniqueKey, component)
        }
    })
    return Array.from(uniqueComponents.values())
}

export const displayToastMessagesOnFileUpload = (
    numberOfLines,
    successCount,
    componentsCreated,
    equipmentCreated,
    templatesAlreadyExisting,
    failureCount
) => {
    toast.info(`Processed ${numberOfLines} lines.`)
    if (componentsCreated > 0)
        toast.success(`Created ${componentsCreated} Component(s).`)
    if (successCount > 0) toast.success(`Created ${successCount} Template(s).`)
    if (equipmentCreated > 0)
        toast.success(`Created ${equipmentCreated} Equipment.`)
    if (templatesAlreadyExisting > 0) {
        toast.warning(`${templatesAlreadyExisting} Template(s) already exist.`)
    }
    if (failureCount > 0 && failureCount !== numberOfLines) {
        toast.error(
            `${failureCount} lines failed, please check your Excel file.`
        )
    }
}
