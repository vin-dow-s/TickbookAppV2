const {
    alphanumericWithSpacesAndSlashesPattern,
    onlyFloatsPattern,
    alphanumericWithSpacesAndSlashesPattern,
    alphanumericWithSpacesAndSlashesPattern,
} = require('../../config/validation')

describe('Cabsched Cable Number Validation Regex', () => {
    test.each([
        // Valid Cases
        ['CAB001', true],
        ['CAB-123', true],
        ['123-CAB', true],
        ['CAB/456', true],

        // Invalid Cases
        ['-CAB001', false],
        ['CAB001-', false],
        ['/CAB001', false],
        ['CAB001/', false],
        [' CAB001', false],
        ['CAB001 ', false],
        ['', false],
        ['CAB001CAB001CAB001CAB001CAB001CAB001CAB001CAB001', false], // Exceeds 45 characters

        // Special Cases
        ['CAB--001', false],
        ['CAB//001', false],
        ['CAB  001', false],
    ])(
        'Cabsched Cable Number Pattern - %s should be valid: %s',
        (input, expected) => {
            expect(alphanumericWithSpacesAndSlashesPattern.test(input)).toBe(expected)
        }
    )
})

describe('Cabsched Length Validation Regex', () => {
    test.each([
        // Valid Cases
        ['10', true],
        ['100.5', true],

        // Invalid Cases
        ['abc', false],
        ['-10', false],
        ['10.5.3', false],
        [' ', false],
        ['', false],
    ])(
        'Cabsched Length Pattern - %s should be valid: %s',
        (input, expected) => {
            expect(onlyFloatsPattern.test(input)).toBe(expected)
        }
    )
})

describe('Cabsched Gland Areas Validation Regex (aGland and zGland)', () => {
    test.each([
        // Valid Cases
        ['AREA1', true],
        ['AREA-1', true],
        ['1-AREA', true],
        ['AREA/1', true],

        // Invalid Cases
        ['-AREA1', false],
        ['AREA1-', false],
        ['/AREA1', false],
        ['AREA1/', false],
        [' AREA1', false],
        ['AREA1 ', false],
        ['', false],
        [
            'AREA1AREA1AREA1AREA1AREA1AREA1AREA1AREA1AREA1AREA1AREA1AREA1AREA1AREA1AREA1AREA1AREA1AREA1',
            false,
        ], // Exceeds 45 characters

        // Special Cases
        ['AREA--1', false],
        ['AREA//1', false],
        ['AREA  1', false],
    ])(
        'Cabsched Gland Areas Pattern - %s should be valid: %s',
        (input, expected) => {
            expect(alphanumericWithSpacesAndSlashesPattern.test(input)).toBe(expected)
        }
    )
})
