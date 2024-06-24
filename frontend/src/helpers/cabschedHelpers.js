import { toast } from 'react-toastify'
import {
    alphanumericWithSpacesAndSlashesPattern,
    alphanumericWithSpacesDashesParenthesesPattern,
    onlyFloatsPattern,
} from '../utils/regexPatterns'
import { getClassForField } from '../utils/validationFormFields'

export const fieldClasses = (fieldErrors, fieldValues) => ({
    CabNum: getClassForField('CabNum', fieldErrors, fieldValues),
    CabSize: getClassForField('CabSize', fieldErrors, fieldValues),
    EquipRef: getClassForField('EquipRef', fieldErrors, fieldValues),
    Length: getClassForField('Length', fieldErrors, fieldValues),
    AGlandArea: getClassForField('AGlandArea', fieldErrors, fieldValues),
    ZGlandArea: getClassForField('ZGlandArea', fieldErrors, fieldValues),
})

export const cabschedValidators = {
    CabNum: (value) =>
        alphanumericWithSpacesAndSlashesPattern.test(value)
            ? ''
            : 'CabNum should be 3-45 characters long.',
    Length: (value) =>
        onlyFloatsPattern.test(value) ? '' : 'Length must be a number.',
    AGlandArea: (value) =>
        alphanumericWithSpacesDashesParenthesesPattern.test(value)
            ? ''
            : 'AGland Area should be 2-45 characters long.',
    ZGlandArea: (value) =>
        alphanumericWithSpacesDashesParenthesesPattern.test(value)
            ? ''
            : 'ZGland Area should be 2-45 characters long.',
}

export const validateCabschedCreationFileData = (
    jsonData,
    cabSizesData,
    equipmentRefs
) => {
    let cabscheds = []
    let detailedErrors = []
    let nonExistentCabSize = new Set()
    let nonExistentEquipRef = new Set()

    jsonData.forEach((row, index) => {
        let rowErrors = []

        // Trim all string fields
        Object.keys(row).forEach((key) => {
            if (typeof row[key] === 'string') {
                row[key] = row[key].trim()
            }
        })

        // Check for missing values and validate formats
        if (!row.CabNum || !row.CabSize || !row.Length || !row.EquipRef) {
            rowErrors.push(`Missing value(s)`)
        }
        if (
            row.CabNum &&
            !alphanumericWithSpacesAndSlashesPattern.test(row.CabNum)
        ) {
            rowErrors.push(`Invalid CabNum format: '${row.CabNum}'`)
        }
        if (row.Length && !onlyFloatsPattern.test(row.Length)) {
            rowErrors.push(`Invalid Length format: '${row.Length}'`)
        }
        if (
            row.AGlandArea &&
            !alphanumericWithSpacesDashesParenthesesPattern.test(row.AGlandArea)
        ) {
            rowErrors.push(`Invalid AGlandArea format: '${row.AGlandArea}'`)
        }
        if (
            row.ZGlandArea &&
            !alphanumericWithSpacesDashesParenthesesPattern.test(row.ZGlandArea)
        ) {
            rowErrors.push(`Invalid ZGlandArea format: '${row.ZGlandArea}'`)
        }
        if (
            (row.AGlandComp && !onlyFloatsPattern.test(row.AGlandComp)) ||
            row.AGlandComp < 0 ||
            row.AGlandComp > 1
        ) {
            rowErrors.push(`Invalid AGlandComp format: '${row.AGlandComp}'`)
        }
        if (
            (row.ZGlandComp && !onlyFloatsPattern.test(row.ZGlandComp)) ||
            row.ZGlandComp < 0 ||
            row.ZGlandComp > 1
        ) {
            rowErrors.push(`Invalid ZGlandComp format: '${row.ZGlandComp}'`)
        }
        if (
            (row.CabComp && !onlyFloatsPattern.test(row.CabComp)) ||
            row.CabComp < 0 ||
            row.CabComp > 1
        ) {
            rowErrors.push(`Invalid CabComp format: '${row.CabComp}'`)
        }
        if (
            (row.CabTest && !onlyFloatsPattern.test(row.CabTest)) ||
            row.CabTest < 0 ||
            row.CabTest > 1
        ) {
            rowErrors.push(`Invalid CabTest format: '${row.CabTest}'`)
        }

        const cabSize = cabSizesData.find(
            (cabSize) => cabSize.Name === row.CabSize
        )
        if (!cabSize) {
            nonExistentCabSize.add(row.CabSize)
        }

        if (!equipmentRefs.some((equipRef) => equipRef.Ref === row.EquipRef)) {
            nonExistentEquipRef.add(row.EquipRef)
        }

        if (rowErrors.length === 0) {
            cabscheds.push({ ...row, Component_ID: cabSize?.id })
        } else {
            detailedErrors.push({
                line: index + 2,
                errors: rowErrors,
                rowData: row,
            })
        }
    })

    // Compile error messages
    const errorMessages = detailedErrors.map(
        (detail) => `Line ${detail.line}: ${detail.errors.join(', ')}`
    )

    return {
        cabscheds,
        nonExistentCabSize: Array.from(nonExistentCabSize),
        nonExistentEquipRef: Array.from(nonExistentEquipRef),
        errorMessages,
    }
}

export const displayToastMessagesOnFileUpload = (
    numberOfLines,
    successCount,
    failureCount,
    cabschedAlreadyExisting
) => {
    toast.info(`Processed ${numberOfLines} lines.`)

    if (successCount > 0) toast.success(`Created ${successCount} Cabscheds.`)
    if (cabschedAlreadyExisting > 0) {
        toast.warning(`${cabschedAlreadyExisting} Cabsched already exist.`)
    }
    if (successCount === 0 && failureCount === 0) {
        toast.warning(`No New Cabsched to create.`)
    }
    if (failureCount > 0) {
        toast.error(
            `${failureCount} lines failed, please check your Excel file.`
        )
    }
}
