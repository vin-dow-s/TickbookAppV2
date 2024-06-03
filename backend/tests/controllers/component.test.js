const {
    getProjectComponents,
} = require('../../controllers/componentController')
const { Component } = require('../../models')
const errorCodes = require('../../config/errorCodes')

jest.mock('../../models', () => {
    return {
        Component: {
            findAll: jest.fn(),
        },
    }
})

describe('getProjectComponents', () => {
    it('should return an empty array for a jobNo with no components', async () => {
        Component.findAll.mockResolvedValue([]) // Simulating no components found

        const req = { params: { jobNo: 'jobNoWithNoComponents' } }
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() }

        await getProjectComponents(req, res, next)

        expect(res.json).toHaveBeenCalledWith([]) // Expecting an empty array
        expect(res.status).not.toHaveBeenCalledWith(500)
    })

    it('should return components list for valid jobNo', async () => {
        const mockComponents = [
            { id: 1, name: 'Component1' },
            { id: 2, name: 'Component2' },
        ]
        Component.findAll.mockResolvedValue(mockComponents)

        const req = { params: { jobNo: 'X11661' } }
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() }

        await getProjectComponents(req, res, next)

        expect(res.json).toHaveBeenCalledWith(mockComponents)
        expect(res.status).not.toHaveBeenCalledWith(500)
    })

    it('should return an error for an invalid jobNo', async () => {
        Component.findAll.mockRejectedValue(new Error('Invalid jobNo'))

        const req = { params: { jobNo: 'A-4-5-6' } }
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() }

        await getProjectComponents(req, res, next)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({
            message: errorCodes.GENERIC_ERROR_MESSAGE,
        })
    })

    it('should return a 500 error for a database retrieval error', async () => {
        Component.findAll.mockImplementation(() => {
            throw new Error('Database error')
        })

        const req = { params: { jobNo: 'jobNoWithError' } }
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() }

        await getProjectComponents(req, res, next)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({
            message: errorCodes.GENERIC_ERROR_MESSAGE,
        })
    })
})
