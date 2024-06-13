import { create } from 'zustand'

import {
    generateProjectsURL,
    generateCodesURL,
    generateProjectCabschedsURL,
    generateProjectComponentsURL,
    generateProjectEquipmentURL,
    generateProjectTemplatesURL,
    updateEquipRecoveryAndCompletionURL,
    bulkUpdateEquipmentCompletionByComponentsURL,
    deleteEquipmentURL,
    updateEquipmentURL,
    updateComponentURL,
    deleteComponentURL,
    generateProjectComponentsBulkURL,
} from '../utils/apiConfig'
import { readExcelFile } from '../utils/readExcelFile'

const useStore = create((set) => ({
    jobNo: '',
    jobTitle: '',
    jobAddress: '',
    projectsList: [],
    codesList: [],
    componentsList: [],
    templatesList: [],
    equipmentList: [],
    cabschedsList: [],
    isLoading: false,
    viewType: 'Section',
    dataHasChanged: false,

    setJobNo: (jobNo) => set({ jobNo }),
    setJobTitle: (jobTitle) => set({ jobTitle }),
    setJobAddress: (jobAddress) => set({ jobAddress }),
    setProjectsList: (projects) => set({ projectsList: projects }),
    setCodesList: (codes) => set({ codesList: codes }),
    setComponentsList: (components) => set({ componentsList: components }),
    setTemplatesList: (templates) => set({ templatesList: templates }),
    setEquipmentList: (equipment) => set({ equipmentList: equipment }),
    setCabschedsList: (cabscheds) => set({ cabschedsList: cabscheds }),
    setViewType: (type) => set({ viewType: type }),
    setDataHasChanged: (hasChanged) => set({ dataHasChanged: hasChanged }),
    resetDataHasChanged: () => set({ dataHasChanged: false }),

    fetchProjectsList: async () => {
        set({ isLoading: true })
        try {
            const response = await fetch(generateProjectsURL())
            const data = await response.json()
            set({ projectsList: data })
        } catch (error) {
            console.error(error)
        } finally {
            set({ isLoading: false })
        }
    },

    fetchCodesList: async (jobNo) => {
        set({ isLoading: true })
        try {
            const response = await fetch(generateCodesURL(jobNo))
            const data = await response.json()
            set({ codesList: data })
        } catch (error) {
            console.error(error)
        } finally {
            set({ isLoading: false })
        }
    },

    fetchComponentsList: async (jobNo) => {
        set({ isLoading: true })
        try {
            const response = await fetch(generateProjectComponentsURL(jobNo))
            const data = await response.json()
            set({ componentsList: data })
        } catch (error) {
            console.error(error)
        } finally {
            set({ isLoading: false })
        }
    },

    fetchTemplatesList: async (jobNo) => {
        set({ isLoading: true })
        try {
            const response = await fetch(generateProjectTemplatesURL(jobNo))
            const data = await response.json()
            set({ templatesList: data })
        } catch (error) {
            console.error(error)
        } finally {
            set({ isLoading: false })
        }
    },

    fetchEquipmentList: async (jobNo) => {
        set({ isLoading: true })
        try {
            const response = await fetch(generateProjectEquipmentURL(jobNo))
            const data = await response.json()
            set({ equipmentList: data })
        } catch (error) {
            console.error(error)
        } finally {
            set({ isLoading: false })
        }
    },

    fetchCabschedsList: async (jobNo) => {
        set({ isLoading: true })
        try {
            const response = await fetch(generateProjectCabschedsURL(jobNo))
            const data = await response.json()
            set({ cabschedsList: data })
        } catch (error) {
            console.error(error)
        } finally {
            set({ isLoading: false })
        }
    },

    onProjectSelect: (project) => {
        const jobNo = project?.JobNo
        const jobTitle = project?.Title
        const jobAddress = project?.Address
        set({ jobNo, jobTitle, jobAddress })
    },

    onProjectCreate: (project) => {
        set((state) => ({
            projectsList: [...state.projectsList, project],
        }))
    },

    onComponentCreate: async (jobNo, componentData) => {
        if (componentData.Name) {
            componentData.Name = componentData.Name.trim()
        }

        if (componentData.Code === 'ttl') {
            componentData = {
                ...componentData,
                LabNorm: 0,
                LabUplift: 0,
                MatNorm: 0,
                SubConCost: 0,
                SubConNorm: 0,
                PlantCost: 0,
            }
        }

        const dataToSend = {
            ...componentData,
            LabNorm: parseFloat(componentData.LabNorm),
            LabUplift: parseFloat(componentData.LabUplift),
            MatNorm: parseFloat(componentData.MatNorm),
            SubConCost: parseFloat(componentData.SubConCost),
            SubConNorm: parseFloat(componentData.SubConNorm),
            PlantCost: parseFloat(componentData.PlantCost),
        }

        if (componentData.Code !== 'cbs') {
            delete dataToSend.GlandNorm
            delete dataToSend.TestNorm
        }

        try {
            const response = await fetch(generateProjectComponentsURL(jobNo), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            })

            if (response.status === 409) {
                const responseBody = await response.json()
                console.error('Conflict Error:', responseBody.message)
                return {
                    success: false,
                    error: responseBody.message,
                    statusCode: response.status,
                }
            } else if (!response.ok) {
                console.error(
                    'Error:',
                    'An error occurred while creating a new Component.'
                )
                const responseBody = await response.json()
                console.error('Error:', responseBody.message)
                return { success: false, error: responseBody.message }
            } else if (response.ok) {
                const newComponent = await response.json()
                set((state) => ({
                    componentsList: [...state.componentsList, newComponent],
                }))
                return { success: true, component: newComponent }
            }
        } catch (error) {
            console.error('Error:', error)
            return { success: false, error: error.message }
        }
    },

    onComponentsBulkCreate: async (jobNo, componentsData) => {
        const processedData = componentsData.map((componentData) => {
            const defaultComponentData = {
                Code: componentData.Code,
                Name: componentData.Name,
                LabUplift: componentData.LabUplift || 0,
                MatNorm: componentData.MatNorm || 0,
                SubConCost: componentData.SubConCost || 0,
                SubConNorm: componentData.SubConNorm || 0,
                PlantCost: componentData.PlantCost || 0,
            }

            if (componentData.Name) {
                componentData.Name = componentData.Name.trim()
            }

            return {
                ...defaultComponentData,
                ...componentData,
            }
        })

        try {
            const response = await fetch(
                generateProjectComponentsBulkURL(jobNo),
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(processedData),
                }
            )

            const responseBody = await response.json()
            if (response.ok) {
                if (
                    responseBody?.success &&
                    Array.isArray(responseBody.success)
                ) {
                    set((state) => ({
                        componentsList: [
                            ...state.componentsList,
                            ...responseBody.success,
                        ],
                    }))
                    return {
                        success: true,
                        results: responseBody,
                    }
                } else {
                    return {
                        success: false,
                        error: 'Unexpected response format',
                    }
                }
            } else {
                return {
                    success: false,
                    error: responseBody.message,
                    statusCode: response.status,
                }
            }
        } catch (error) {
            console.error('Error:', error)
            return { success: false, error: error.message }
        }
    },

    onComponentUpdate: async (
        jobNo,
        componentToUpdate,
        fieldValuesToUpdate
    ) => {
        try {
            const url = updateComponentURL(jobNo, componentToUpdate)

            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fieldValuesToUpdate),
            })

            if (response.ok) {
                const updatedComponent = await response.json()
                set((state) => ({
                    componentsList: state.componentsList.map((component) =>
                        component.ID === componentToUpdate
                            ? updatedComponent
                            : component
                    ),
                }))
                return updatedComponent
            } else {
                const responseBody = await response.json()
                console.error('Updating Error:', responseBody.message)
                return null
            }
        } catch (error) {
            console.error('Error:', error)
            return null
        }
    },

    onComponentDelete: async (jobNo, componentId) => {
        try {
            const response = await fetch(
                deleteComponentURL(jobNo, componentId),
                {
                    method: 'DELETE',
                }
            )

            if (response.ok) {
                set((state) => ({
                    componentsList: state.componentsList.filter(
                        (component) => component.ID !== componentId
                    ),
                }))
                return { success: true }
            } else {
                const responseBody = await response.json()
                return {
                    success: false,
                    error: responseBody.message,
                }
            }
        } catch (error) {
            console.error('Error:', error)
            return {
                success: false,
                error: error.message,
            }
        }
    },

    handleComponentFileUpload: async (
        jobNo,
        file,
        codesList,
        setCreationStepMessage
    ) => {
        try {
            setCreationStepMessage('Reading Excel file...')
            const jsonData = await readExcelFile(file)
            let finalComponentsData = []
            const nonExistingCodes = new Set()

            for (const componentData of jsonData) {
                const codeExists = codesList.some(
                    (item) => item.Code === componentData.Code
                )

                if (!codeExists) {
                    nonExistingCodes.add(componentData.Code)
                    continue
                }

                finalComponentsData.push({
                    ...componentData,
                    lineNumber: componentData.__rowNum__ + 1,
                })
            }

            setCreationStepMessage('Creating Components...')
            const bulkCreateResult = await useStore
                .getState()
                .onComponentsBulkCreate(jobNo, finalComponentsData)

            return {
                bulkCreateResult,
                jsonDataLength: jsonData.length,
                nonExistingCodes,
            }
        } catch (error) {
            console.error('Error during file processing:', error)
            return { success: false, error: error.message }
        }
    },

    onEquipmentCompletionUpdate: async (
        jobNo,
        ID,
        percentComplete,
        rowData
    ) => {
        let url
        let bodyData
        const currentRecovery = (
            (rowData.LabNorm * percentComplete) /
            100
        ).toFixed(2)

        //Check the type of the Equipment to update the correct field
        switch (rowData.Type) {
            case 'Cable':
                url = updateEquipRecoveryAndCompletionURL(jobNo, ID)
                bodyData = {
                    JobNo: jobNo,
                    Ref: rowData.Ref,
                    CabNum: ID,
                    CabComp: Math.round(percentComplete),
                    CurrentRecovery: currentRecovery,
                }
                break
            case 'CableA':
                url = updateEquipRecoveryAndCompletionURL(jobNo, ID)
                bodyData = {
                    JobNo: jobNo,
                    Ref: rowData.Ref,
                    CabNum: ID,
                    AGlandComp: Math.round(percentComplete),
                    CurrentRecovery: currentRecovery,
                }
                break
            case 'CableZ':
                url = updateEquipRecoveryAndCompletionURL(jobNo, ID)
                bodyData = {
                    JobNo: jobNo,
                    Ref: rowData.Ref,
                    CabNum: ID,
                    ZGlandComp: Math.round(percentComplete),
                    CurrentRecovery: currentRecovery,
                }
                break
            case 'CableT':
                url = updateEquipRecoveryAndCompletionURL(jobNo, ID)
                bodyData = {
                    JobNo: jobNo,
                    Ref: rowData.Ref,
                    CabNum: ID,
                    CabTest: Math.round(percentComplete),
                    CurrentRecovery: currentRecovery,
                }
                break
            default:
                url = updateEquipRecoveryAndCompletionURL(jobNo, ID)
                bodyData = {
                    JobNo: jobNo,
                    Ref: rowData.Ref,
                    ID: ID,
                    Complete: Math.round(percentComplete),
                    CurrentRecovery: currentRecovery,
                    Type: 'Component',
                }
        }

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyData),
            })

            if (response.ok) {
                const result = await response.json()
                const recalculatedRow = result.recalculatedRow

                // Update state for equipmentList and cabschedsList as needed
                set((state) => {
                    const updatedEquipmentList = state.equipmentList.map(
                        (equip) => {
                            const updatedEquip = result.updatedEquipments.find(
                                (updated) => updated.ID === equip.ID
                            )
                            if (updatedEquip) {
                                return {
                                    ...equip,
                                    Complete: updatedEquip.Complete,
                                    Description: updatedEquip.Description,
                                    Template: updatedEquip.Template,
                                    Area: updatedEquip.Area,
                                }
                            }
                            return equip
                        }
                    )

                    const updatedCabschedsList = state.cabschedsList.map(
                        (existingCable) => {
                            const cableToUpdate = result.updatedCabscheds.find(
                                (updatedCableFromServer) =>
                                    updatedCableFromServer.CabNum ===
                                    existingCable.CabNum
                            )
                            return cableToUpdate || existingCable
                        }
                    )

                    return {
                        equipmentList: updatedEquipmentList,
                        cabschedsList: updatedCabschedsList,
                        dataHasChanged: true,
                    }
                })

                return recalculatedRow
            } else {
                console.error('Failed to update item:', await response.text())
                throw new Error('Failed to update item.')
            }
        } catch (error) {
            console.error('Error while updating the completion:', error)
            throw error
        }
    },

    onEquipmentCompletionByComponentsBulkUpdate: async (jobNo, updates) => {
        try {
            const response = await fetch(
                bulkUpdateEquipmentCompletionByComponentsURL(jobNo),
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ updates }),
                }
            )

            if (response.ok) {
                const result = await response.json()
                const recalculatedRow = result.recalculatedRow[0]

                // Update state for equipmentList and cabschedsList as needed
                set((state) => {
                    const updatedEquipmentList = state.equipmentList.map(
                        (equip) => {
                            const updatedEquip = result.updatedEquipments.find(
                                (updated) => updated.ID === equip.ID
                            )
                            if (updatedEquip) {
                                return {
                                    ...equip,
                                    Complete: updatedEquip.Complete,
                                    Description: updatedEquip.Description,
                                    Template: updatedEquip.Template,
                                    Area: updatedEquip.Area,
                                }
                            }
                            return equip
                        }
                    )

                    const updatedCabschedsList = state.cabschedsList.map(
                        (existingCable) => {
                            const cableToUpdate = result.updatedCabscheds.find(
                                (updatedCableFromServer) =>
                                    updatedCableFromServer.CabNum ===
                                    existingCable.CabNum
                            )
                            return cableToUpdate || existingCable
                        }
                    )

                    return {
                        equipmentList: updatedEquipmentList,
                        cabschedsList: updatedCabschedsList,
                        dataHasChanged: true,
                    }
                })

                return recalculatedRow
            } else {
                console.error('Failed to update items:', await response.text())
                throw new Error('Failed to update items.')
            }
        } catch (error) {
            console.error('Error while updating the completion:', error)
            throw error
        }
    },

    onEquipmentUpdate: async (jobNo, oldRef, fieldValuesToUpdate) => {
        try {
            const url = updateEquipmentURL(jobNo, oldRef)

            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fieldValuesToUpdate),
            })

            if (response.ok) {
                const updatedEquipmentFromServer = await response.json()

                set((state) => {
                    const updatedEquipmentList = state.equipmentList.map(
                        (equip) =>
                            equip.Ref === oldRef
                                ? updatedEquipmentFromServer.updatedEquipment
                                : equip
                    )
                    const updatedCabschedsList = state.cabschedsList.map(
                        (cabsched) =>
                            updatedEquipmentFromServer.updatedCabscheds.find(
                                (updated) => updated.CabNum === cabsched.CabNum
                            ) || cabsched
                    )
                    return {
                        equipmentList: updatedEquipmentList,
                        cabschedsList: updatedCabschedsList,
                        dataHasChanged: true,
                    }
                })
            } else {
                console.error(
                    'Failed to update equipment:',
                    await response.text()
                )
                throw new Error('Failed to update equipment.')
            }
        } catch (error) {
            console.error('Error while updating the equipment:', error)
            throw error
        }
    },

    onEquipmentDelete: async (
        jobNo,
        deletedEquipment,
        deleteAssociatedCables
    ) => {
        try {
            const requestOptions = {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deleteAssociatedCables: deleteAssociatedCables,
                }),
            }

            const response = await fetch(
                deleteEquipmentURL(jobNo, deletedEquipment.Ref),
                requestOptions
            )

            const result = await response.json()
            if (response.ok) {
                set((state) => ({
                    equipmentList: state.equipmentList.filter(
                        (equip) => equip.Ref !== deletedEquipment.Ref
                    ),
                    cabschedsList: deleteAssociatedCables
                        ? state.cabschedsList.filter(
                              (cable) =>
                                  !result.deletedCabscheds.some(
                                      (deletedCable) =>
                                          deletedCable.CabNum === cable.CabNum
                                  )
                          )
                        : state.cabschedsList,
                    dataHasChanged: true,
                }))

                return {
                    success: true,
                    deletedCabschedsCount: result.deletedCabscheds.length,
                }
            } else {
                return { success: false, message: result.message }
            }
        } catch (error) {
            console.error('Error:', error)
            return { success: false, message: error.message }
        }
    },
}))

export default useStore
