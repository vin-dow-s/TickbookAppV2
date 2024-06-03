module.exports = {
    GENERIC_ERROR: {
        message: 'An error occurred while processing the request.',
        status: 500,
    },
    UNIQUE_CONSTRAINT_ERROR: {
        message: 'This resource already exists.',
        status: 409,
    },
    NOT_FOUND_ERROR: {
        message: 'The requested resource was not found.',
        status: 404,
    },
    VALIDATION_ERROR: {
        message: 'Validation failed for the input data.',
        status: 400,
    },
    FOREIGN_KEY_CONSTRAINT_ERROR: {
        message: 'Validation failed because of a Foreign Key constraint.',
        status: 409,
    },
}
