const {
    componentsCodePattern,
    componentsNamePattern,
    onlyFloatsPattern,
} = require('../../config/validation')

describe('Components Code Validation Regex', () => {
    test.each([
        // Valid Cases
        ['ABC', true],
        ['Abc', true],
        ['abc', true],

        // Invalid Cases
        ['', false],
        ['   ', false],
        [' A ', false],
        [' AA', false],
        ['AA ', false],
        ['ABCD', false],
        ['abcd', false],
        ['X12', false],
        ['123', false],
        [' 1 ', false],
        ['01 ', false],
        [' 10', false],

        // Special Characters
        ['(=}', false],
        ['<A>', false],
        ['<1>', false],
    ])('Code Pattern - %s should be valid: %s', (input, expected) => {
        expect(componentsCodePattern.test(input)).toBe(expected)
    })
})

describe('Components Name Validation Regex', () => {
    test.each([
        // Valid Cases
        ['ComponentName', true],
        ['Component123', true],
        ['Component-Name', true],
        ['Component/Name', true],
        ['Component Name', true],

        // Invalid Cases with Special Characters or Numbers
        ['-Component', false],
        ['Component-', false],
        ['/Component', false],
        ['Component/', false],
        [' Component', false],
        ['Component ', false],
        [
            'ComponentNameWhichIsUnnecessarilyLongAndExceedsTheMaximumAllowedLengthOfEightyCharacters',
            false,
        ],
        ['Component@Name', false],

        // Edge Cases
        ['', false],
        ['C', true], // If single characters are allowed
        [
            'ComponentNameThatExactlyMatchesTheMaximumAllowedLengthOfEightyCharactersForAName',
            true,
        ], // 80 chars long

        // Whitespace Handling
        ['Component   Name', false],
        ['Component--Name', false],
        ['Component//Name', false],

        // Case Sensitivity
        ['componentname', true],
        ['COMPONENTNAME', true],
        ['ComponentNAME', true],
    ])('Name Pattern - %s should be valid: %s', (input, expected) => {
        expect(componentsNamePattern.test(input)).toBe(expected)
    })
})

describe('Components LabNorm/LabUplift/MatNorm/SCCost/SCNorm/PlantCost/GlandNorm/TestNorm Validation Regex', () => {
    test.each([
        // Valid Cases
        ['0', true],
        ['1', true],
        ['10', true],
        ['123456', true],
        ['0.1', true],
        ['1.0', true],
        ['10.5', true],
        ['123.456', true],

        // Invalid Cases
        ['abc', false],
        ['-1', false],
        ['1.2.3', false],
        [' 1', false],
        ['1 ', false],
        ['1.', false],
        ['.', false],
        ['.1', false],
        ['1.23.45', false],
        ['1,23', false],
        ['--1', false],
        ['++1', false],
        ['1e10', false],
    ])(
        'Components Number only Pattern - %s should be valid: %s',
        (input, expected) => {
            expect(onlyFloatsPattern.test(input)).toBe(expected)
        }
    )
})
