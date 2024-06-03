const { templatesTempNamePattern } = require('../../config/validation')

describe('Template Name Validation Regex', () => {
    test.each([
        // Valid Cases
        ['TemplateName', true],
        ['Template123', true],
        ['Template-Name', true],
        ['Template/Name', true],
        ['Template Name', true],

        // Invalid Cases with Special Characters or Numbers
        ['-Template', false],
        ['Template-', false],
        ['/Template', false],
        ['Template/', false],
        [' Template', false],
        ['Template ', false],
        [
            'TemplateNameWhichIsUnnecessarilyLongAndExceedsTheMaximumAllowedLengthOfEightyCharacters',
            false,
        ],
        ['Template@Name', false],

        // Edge Cases
        ['', false],
        ['C', true], // If single characters are allowed
        [
            'TemplateNameThatExactlyMatchesTheMaximumAllowedLengthOfEightyCharactersForANamea',
            true,
        ], // 80 chars long

        // Whitespace Handling
        ['Template   Name', false],
        ['Template--Name', false],
        ['Template//Name', false],

        // Case Sensitivity
        ['Templatename', true],
        ['TemplateNAME', true],
        ['TemplateNAME', true],
    ])('Template Name Pattern - %s should be valid: %s', (input, expected) => {
        expect(templatesTempNamePattern.test(input)).toBe(expected)
    })
})
