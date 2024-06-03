const { codeCodePattern, alphanumericWithSpacesPattern } = require('../../config/validation')

describe('Codes Code Validation Regex', () => {
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
        expect(codeCodePattern.test(input)).toBe(expected)
    })
})
describe('Codes Name Validation Regex', () => {
    test.each([
        // Valid Cases
        ['CodeName', true],
        ['Code123', true],
        ['Code-Name', true],
        ['Code Name', true],

        // Invalid Cases with Special Characters or Length
        ['-Code', false],
        ['Code-', false],
        [' Code', false],
        ['Code ', false],
        ['CodeNameWhichIsLongerThanTheAllowedFortyFiveCharactersLimit', false],
        ['Code@Name', false],
        ['/Code', false],
        ['Code/', false],

        // Edge Cases
        ['', false],
        ['C', true], // Single character allowed
        ['CodeNameThatMatchesFortyFiveCharsLimitExactly', true], // 45 chars long

        // Whitespace and Hyphen Handling
        ['Code   Name', false], // Multiple spaces not allowed
        ['Code--Name', false], // Multiple hyphens not allowed
        ['Code//Name', false], // Slashes not allowed

        // Case Sensitivity
        ['codename', true],
        ['CodeNAME', true],
    ])('Name Pattern - %s should be valid: %s', (input, expected) => {
        expect(alphanumericWithSpacesPattern.test(input)).toBe(expected)
    })
})
