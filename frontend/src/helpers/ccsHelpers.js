import { ccDescriptionPattern, ccRefPattern } from '../utils/regexPatterns'

export const ccsValidators = {
    CcRef: (value) =>
        ccRefPattern.test(value) ? '' : 'CC Ref contains invalid character.',
    Description: (value) =>
        ccDescriptionPattern.test(value)
            ? ''
            : 'Description contains invalid characters.',
}
