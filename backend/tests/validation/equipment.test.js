const {
    equipmentRefPattern,
    equipmentDescriptionPattern,
} = require('../../config/validation')

describe('Equipment Ref Validation Regex', () => {
    test.each([
        // Valid Cases
        ['Ref123', true],
        ['Ref-123', true],
        ['Ref/123', true],
        ['Ref 123', true],
        ['Ref-123/456', true],

        // Invalid Cases with Special Characters or Length
        ['-Ref', false],
        ['Ref-', false],
        ['/Ref', false],
        ['Ref/', false],
        [' Ref', false],
        ['Ref ', false],
        ['Ref12345678901234', false], // More than 14 characters

        // Edge Cases
        ['', false],
        ['R', true],

        // Whitespace and Special Character Handling
        ['Ref--123', false],
        ['Ref//123', false],
        ['Ref   123', false],

        // Case Sensitivity
        ['ref123', true],
        ['REF123', true],
    ])('Equipment Ref Pattern - %s should be valid: %s', (input, expected) => {
        expect(equipmentRefPattern.test(input)).toBe(expected)
    })
})

describe('Equipment Description/Section/Area/TendSection/CurrentRevision Validation Regex', () => {
    test.each([
        // Valid Cases
        ['Description', true],
        ['Desc-123', true],
        ['Desc/123', true],
        ['Desc 123', true],
        ['Desc-123/456', true],

        // Invalid Cases with Special Characters or Length
        ['-Desc', false],
        ['Desc-', false],
        ['/Desc', false],
        ['Desc/', false],
        [' Desc', false],
        ['Desc ', false],
        [
            'StringThatIsUnnecessarilyLongAndExceedsTheMaximumAllowedLengthOfCharactersForAllFields',
            false,
        ],

        // Edge Cases
        ['', false],
        ['D', true],

        // Whitespace and Special Character Handling
        ['Desc--123', false],
        ['Desc//123', false],
        ['Desc   123', false],

        // Case Sensitivity
        ['description', true],
        ['DESCRIPTION', true],
    ])(
        'Equipment Names Pattern - %s should be valid: %s',
        (input, expected) => {
            expect(equipmentDescriptionPattern.test(input)).toBe(expected)
        }
    )
})
