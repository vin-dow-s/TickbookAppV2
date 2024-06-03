const {
    alphanumericWithSpacesPattern,
    alphanumericWithSpacesPattern,
    projectNumberPattern,
} = require('../../config/validation')

describe('Project Title/Address Validation Regex', () => {
    const testCases = [
        // Valid Cases
        ['ProjectTitle', true],
        ['Project-Title', true],
        ['Project Title', true],
        ['Project123', true],
        ['Proj123 Tit', true],

        // Invalid Cases with Special Characters, Numbers, or Length
        ['-Project', false],
        ['Project-', false],
        [' Project', false],
        ['Project ', false],
        [
            'ProjectNameWhichIsLongerThanTheAllowedFortyFiveCharactersLimit',
            false,
        ],
        ['Project@Title', false],
        ['/Project', false],
        ['Project/', false],

        // Edge Cases
        ['', false],
        ['P', true], // If single characters are allowed
        ['ProjectTitleThatHasFortyFiveCharactersExactly', true], // 45 chars long

        // Whitespace and Hyphen Handling
        ['Project   Title', false], // Multiple spaces not allowed
        ['Project--Title', false], // Multiple hyphens not allowed
        ['Project/Title', false], // Slashes not allowed

        // Case Sensitivity
        ['projecttitle', true],
        ['PROJECTTITLE', true],
        ['ProjectTITLE', true],
    ]

    test.each(testCases)(
        'Project Title Pattern - %s should be valid: %s',
        (input, expected) => {
            expect(alphanumericWithSpacesPattern.test(input)).toBe(expected)
        }
    )

    test.each(testCases)(
        'Project Address Pattern - %s should be valid: %s',
        (input, expected) => {
            expect(alphanumericWithSpacesPattern.test(input)).toBe(expected)
        }
    )
})

describe('Project Number Validation Regex', () => {
    test.each([
        // Valid Cases
        ['A12345', true],
        ['Z12345', true],
        ['A12345B', true],

        // Invalid Cases
        ['123456', false],
        ['ABC123', false],
        ['12345A', false],
        ['A123456', false],
        ['A1234', false],
        ['AA12345', false],
        ['A12345AA', false],
        ['12345', false],
        ['', false],
    ])('Project Number Pattern - %s should be valid: %s', (input, expected) => {
        expect(projectNumberPattern.test(input)).toBe(expected)
    })
})
